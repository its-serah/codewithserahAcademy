from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.community import Post, Comment, PostLike
from app.schemas.community import (
    PostCreate,
    PostOut,
    CommentCreate,
    CommentOut,
    LikeToggleResponse,
)
from app.utils.auth import decode_access_token

router = APIRouter(prefix="/api/community", tags=["community"])

optional_bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if creds is None:
        return None
    user_id = decode_access_token(creds.credentials)
    if user_id is None:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        return None
    return user


def _build_comment_out(comment: Comment, author: User) -> CommentOut:
    return CommentOut(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        body=comment.body,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
        author_name=author.name if author else "Unknown",
        author_emoji=author.avatar_emoji if author else None,
        replies=[],
    )


def _load_nested_comments(db: Session, post_id: int) -> List[CommentOut]:
    """Load all comments for a post, organize into top-level + nested replies."""
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    if not comments:
        return []

    user_ids = {c.user_id for c in comments}
    users = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()}

    nodes: dict[int, CommentOut] = {}
    for c in comments:
        nodes[c.id] = _build_comment_out(c, users.get(c.user_id))

    roots: List[CommentOut] = []
    for c in comments:
        node = nodes[c.id]
        if c.parent_id and c.parent_id in nodes:
            nodes[c.parent_id].replies.append(node)
        else:
            roots.append(node)
    return roots


def _build_post_out(
    post: Post,
    author: Optional[User],
    comment_count: int,
    like_count: int,
    liked_by_me: bool,
    comments: Optional[List[CommentOut]] = None,
) -> PostOut:
    return PostOut(
        id=post.id,
        user_id=post.user_id,
        course_id=post.course_id,
        title=post.title,
        body=post.body,
        created_at=post.created_at,
        updated_at=post.updated_at,
        author_name=author.name if author else "Unknown",
        author_emoji=author.avatar_emoji if author else None,
        comment_count=comment_count,
        like_count=like_count,
        liked_by_me=liked_by_me,
        comments=comments or [],
    )


@router.get("/posts", response_model=List[PostOut])
def list_posts(
    course_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """List community posts with counts. Supports filtering and search."""
    q = db.query(Post)
    if course_id is not None:
        q = q.filter(Post.course_id == course_id)
    if search:
        pattern = f"%{search}%"
        q = q.filter(or_(Post.title.ilike(pattern), Post.body.ilike(pattern)))

    posts = q.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    if not posts:
        return []

    post_ids = [p.id for p in posts]
    user_ids = {p.user_id for p in posts}
    authors = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()}

    comment_counts = dict(
        db.query(Comment.post_id, func.count(Comment.id))
        .filter(Comment.post_id.in_(post_ids))
        .group_by(Comment.post_id)
        .all()
    )
    like_counts = dict(
        db.query(PostLike.post_id, func.count(PostLike.id))
        .filter(PostLike.post_id.in_(post_ids))
        .group_by(PostLike.post_id)
        .all()
    )

    liked_ids: set[int] = set()
    if current_user is not None:
        liked_ids = {
            pid
            for (pid,) in db.query(PostLike.post_id)
            .filter(
                PostLike.user_id == current_user.id,
                PostLike.post_id.in_(post_ids),
            )
            .all()
        }

    return [
        _build_post_out(
            post=p,
            author=authors.get(p.user_id),
            comment_count=comment_counts.get(p.id, 0),
            like_count=like_counts.get(p.id, 0),
            liked_by_me=p.id in liked_ids,
        )
        for p in posts
    ]


@router.post("/posts", response_model=PostOut, status_code=201)
def create_post(
    req: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new community post."""
    post = Post(
        user_id=current_user.id,
        course_id=req.course_id,
        title=req.title,
        body=req.body,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _build_post_out(
        post=post,
        author=current_user,
        comment_count=0,
        like_count=0,
        liked_by_me=False,
    )


@router.get("/posts/{post_id}", response_model=PostOut)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get a single post with nested comments."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    author = db.query(User).filter(User.id == post.user_id).first()
    comment_count = (
        db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar()
        or 0
    )
    like_count = (
        db.query(func.count(PostLike.id)).filter(PostLike.post_id == post.id).scalar()
        or 0
    )

    liked_by_me = False
    if current_user is not None:
        liked_by_me = (
            db.query(PostLike)
            .filter(
                PostLike.post_id == post.id,
                PostLike.user_id == current_user.id,
            )
            .first()
            is not None
        )

    comments = _load_nested_comments(db, post.id)

    return _build_post_out(
        post=post,
        author=author,
        comment_count=comment_count,
        like_count=like_count,
        liked_by_me=liked_by_me,
        comments=comments,
    )


@router.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete your own post (or any post if admin)."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    db.delete(post)
    db.commit()


@router.post("/posts/{post_id}/like", response_model=LikeToggleResponse)
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle a like on a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    existing = (
        db.query(PostLike)
        .filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        db.add(PostLike(post_id=post_id, user_id=current_user.id))
        db.commit()
        liked = True

    count = (
        db.query(func.count(PostLike.id)).filter(PostLike.post_id == post_id).scalar()
        or 0
    )
    return LikeToggleResponse(liked=liked, count=count)


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=201)
def create_comment(
    post_id: int,
    req: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a comment or reply on a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    if req.parent_id is not None:
        parent = (
            db.query(Comment)
            .filter(Comment.id == req.parent_id, Comment.post_id == post_id)
            .first()
        )
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment not found on this post",
            )

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        body=req.body,
        parent_id=req.parent_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _build_comment_out(comment, current_user)


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete your own comment (or any comment if admin)."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    db.delete(comment)
    db.commit()

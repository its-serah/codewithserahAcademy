"""Seed the database with waitlist entries and sample course data."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal
from app.models import (
    WaitlistEmail,
    Course,
    Module,
    ContentBlock,
)


def seed():
    db = SessionLocal()

    # Waitlist emails
    waitlist_emails = [
        "roumiyehhawraa@gmail.com",
        "jamela.hallal45@gmail.com",
        "jfestus94@gmail.com",
        "hseinmwe1@gmail.com",
        "batolzrk@gmail.com",
        "chazaaboulhosn@gmail.com",
        "20244306@std.neu.edu.tr",
        "yanahanieh7@gmail.com",
        "20233332@std.neu.edu.tr",
        "oben07839@gmail.com",
        "mahdi.khj98@gmail.com",
        "Medory07@gmail.com",
        "janahsen5@gmail.com",
        "mahdialdakar@gmail.com",
        "nabil_ahmad4@icloud.com",
        "mohammadawad375@gmail.com",
        "wehbetamara177@gmail.com",
        "mhamad.yhya1@gmail.com",
        "ranaalmaaz55@gmail.com",
        "sedrakatlab10112006@gmail.com",
        "Rozalinealjawhary@gmail.com",
        "hiaj.gbk@gmail.com",
        "alaa.allouch02@gmail.com",
        "hisham.yassine@gmail.com",
        "mariamhamid616@gmail.com",
        "AliHussein.data@gmail.com",
        "mernaashraf634@gmail.com",
        "ucheokey24@gmail.com",
        "mantach15@gmail.com",
        "aliabouabbas2005@gmail.com",
        "hijazibilal2002@gmail.com",
        "hadihojeijwork@gmail.com",
        "Rozaline203@gmail.com",
        "ahmadmissalkhi@gmail.com",
        "serah.elrashidi@gmail.com",
    ]
    for email in waitlist_emails:
        if not db.query(WaitlistEmail).filter(WaitlistEmail.email == email).first():
            db.add(WaitlistEmail(email=email))
            print(f"Added to waitlist: {email}")

    db.flush()

    # Sample course
    course = db.query(Course).filter(Course.slug == "intro-to-python").first()
    if not course:
        course = Course(
            title="Intro to Python",
            slug="intro-to-python",
            description="Learn Python from scratch. This beginner-friendly course covers variables, control flow, functions, and more.",
            is_published=True,
        )
        db.add(course)
        db.flush()

        modules_data = [
            {
                "title": "Variables & Data Types",
                "description": "Learn about Python variables, strings, numbers, and booleans.",
                "order_index": 1,
                "blocks": [
                    {
                        "type": "reading",
                        "title": "What are Variables?",
                        "order_index": 1,
                        "markdown_content": (
                            "# Variables in Python\n\n"
                            "A **variable** is a name that refers to a value stored in memory.\n\n"
                            '```python\nname = "Serah"\nage = 25\nis_student = True\n```\n\n'
                            "## Naming Rules\n\n"
                            "- Must start with a letter or underscore\n"
                            "- Can contain letters, numbers, and underscores\n"
                            "- Case-sensitive (`Name` and `name` are different)\n\n"
                            "## Data Types\n\n"
                            "| Type | Example |\n|------|--------|\n"
                            '| `str` | `"hello"` |\n| `int` | `42` |\n'
                            "| `float` | `3.14` |\n| `bool` | `True` |\n"
                        ),
                    },
                    {
                        "type": "video",
                        "title": "Python Variables Explained",
                        "order_index": 2,
                        "youtube_video_id": "cQT33yu9pY8",
                    },
                ],
            },
            {
                "title": "Control Flow",
                "description": "Master if/else statements, loops, and conditional logic.",
                "order_index": 2,
                "blocks": [
                    {
                        "type": "reading",
                        "title": "If/Else Statements",
                        "order_index": 1,
                        "markdown_content": (
                            "# Control Flow in Python\n\n"
                            "Control flow lets your program make decisions.\n\n"
                            "```python\ntemperature = 30\n\n"
                            'if temperature > 25:\n    print("It\'s hot!")\n'
                            'elif temperature > 15:\n    print("It\'s nice.")\n'
                            'else:\n    print("It\'s cold.")\n```\n\n'
                            "## Comparison Operators\n\n"
                            "- `==` equal to\n- `!=` not equal to\n"
                            "- `>` greater than\n- `<` less than\n"
                        ),
                    },
                    {
                        "type": "video",
                        "title": "Python If/Else Tutorial",
                        "order_index": 2,
                        "youtube_video_id": "Zp5MuPOtsSY",
                    },
                ],
            },
            {
                "title": "Functions",
                "description": "Learn to write reusable code with functions.",
                "order_index": 3,
                "blocks": [
                    {
                        "type": "reading",
                        "title": "Defining Functions",
                        "order_index": 1,
                        "markdown_content": (
                            "# Functions in Python\n\n"
                            "Functions let you group reusable code.\n\n"
                            "```python\ndef greet(name):\n"
                            '    return f"Hello, {name}!"\n\n'
                            'message = greet("Serah")\n'
                            "print(message)  # Hello, Serah!\n```\n\n"
                            "## Parameters vs Arguments\n\n"
                            "- **Parameter**: the variable in the function definition\n"
                            "- **Argument**: the value you pass when calling the function\n"
                        ),
                    },
                    {
                        "type": "video",
                        "title": "Python Functions for Beginners",
                        "order_index": 2,
                        "youtube_video_id": "9Os0o3wzS_I",
                    },
                ],
            },
        ]

        for mod_data in modules_data:
            blocks = mod_data.pop("blocks")
            module = Module(course_id=course.id, **mod_data)
            db.add(module)
            db.flush()
            for block_data in blocks:
                db.add(ContentBlock(module_id=module.id, **block_data))

        print("Created sample course: Intro to Python (3 modules)")

    db.commit()
    db.close()
    print("Seed complete!")


if __name__ == "__main__":
    seed()

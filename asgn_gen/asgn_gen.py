from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
from datetime import datetime
from crewai import Agent, Task, Crew, LLM
from fpdf import FPDF
import json

# MongoDB connection
mongo_uri = "mongodb://127.0.0.1:2747/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4"
client = MongoClient(mongo_uri)
db = client["education"]  # Database name
collection = db["assignments"]  # Collection name

# CrewAI setup
API_KEY = "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"
llm = LLM(model="groq/llama-3.3-70b-versatile", api_key=API_KEY)

# Define the agent
question_generator = Agent(
    role='Assignment Question Generator',
    goal='Generate questions for assignments based on given inputs',
    backstory='Experienced educator with expertise in crafting questions of varying complexity and types',
    llm=llm,
    verbose=True
)

def generate_pdf(file_name, title, questions):
    """
    Generate a PDF document for the assignment.
    """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Add Title
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(0, 10, title, ln=True, align='C')
    pdf.ln(10)

    # Add Questions
    pdf.set_font("Arial", size=12)
    for idx, question in enumerate(questions, start=1):
        pdf.multi_cell(0, 10, f"{idx}. {question}")
        pdf.ln(5)

    # Save PDF
    pdf.output(file_name)
    print(f"PDF saved as: {file_name}")

def handle_new_assignment(data):
    """
    Process the new assignment document and integrate it with the CrewAI agent.
    """
    # Convert ObjectId and datetime to strings for JSON serialization
    if "_id" in data:
        data["_id"] = str(data["_id"])

    if "createdAt" in data and isinstance(data["createdAt"], datetime):
        data["createdAt"] = data["createdAt"].isoformat()

    # Extract details
    name = data.get("name", "Unnamed Assignment")
    question_types = ", ".join(data.get("questionTypes", [])) or "Not specified"
    difficulty = data.get("difficulty", "Medium")
    question_count = data.get("questionCount", 0)
    context = data.get("context", "None")

    # Create a dynamic task description
    task_description = (
        f"Generate an assignment with the following details:\n"
        f"Name: {name}\n"
        f"Question Types: {question_types}\n"
        f"Number of Questions: {question_count}\n"
        f"Difficulty: {difficulty}\n"
        f"Context (if applicable): {context}\n"
    )

    # Define the CrewAI task
    question_generation_task = Task(
        description=task_description,
        expected_output=f"A set of {question_count} questions matching the criteria with proper formatting and clarity",
        agent=question_generator
    )

    # Create crew to manage the agent and task workflow
    crew = Crew(
        agents=[question_generator],
        tasks=[question_generation_task],
        verbose=True
    )

    # Execute the workflow
    result = crew.kickoff()

    # Ensure the result is converted to a string for processing
    if hasattr(result, "output"):
        questions = result.output  # Extract questions if present
    else:
        questions = str(result)  # Fallback to string representation

    print("\nGenerated Questions:")
    print(questions)

    # Generate PDF with the results
    title = f"Assignment: {name}"
    file_name = f"{name.replace(' ', '_').lower()}.pdf"
    questions_list = questions.split("\n")  # Split questions into a list for the PDF
    generate_pdf(file_name, title, questions_list)

# Monitor the assignments collection for new inserts
try:
    with collection.watch([{"$match": {"operationType": "insert"}}]) as stream:
        print("Watching for new assignments...")
        for change in stream:
            # Process the inserted document
            document = change["fullDocument"]
            handle_new_assignment(document)
except PyMongoError as e:
    print(f"Error while watching collection: {e}")
except Exception as ex:
    print(f"Unexpected error: {ex}")

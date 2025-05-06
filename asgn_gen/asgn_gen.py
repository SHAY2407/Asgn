from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
from datetime import datetime
from crewai import Agent, Task, Crew, LLM
import re
import os
from fpdf import FPDF
import markdown

# Define the output directory as the script's directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

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

def generate_markdown(file_name, title, questions_content):
    md_content = f"""# {title}

**Instructions:**

- Attempt all questions.
- Some questions may have multiple parts.

"""
    md_content += questions_content

    # Save markdown file in the script's directory
    md_path = os.path.join(SCRIPT_DIR, file_name)
    with open(md_path, "w", encoding="utf-8") as md_file:
        md_file.write(md_content)

    print(f"Markdown file saved as: {md_path}")

    # Define the target directory for the PDF
    target_dir = os.path.join(SCRIPT_DIR, "../client/public/asgn_gen")
    os.makedirs(target_dir, exist_ok=True)  # Ensure the directory exists

    # Generate PDF in the target directory
    pdf_file = os.path.join(target_dir, os.path.splitext(file_name)[0] + ".pdf")
    convert_markdown_to_pdf(md_content, pdf_file)


class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 16)
        self.cell(0, 10, "Chemistry Assignment", ln=True, align="C")
        self.ln(10)

    def chapter_title(self, title):
        self.set_font("Arial", "B", 12)
        self.multi_cell(0, 7, title)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font("Arial", size=12)
        self.multi_cell(0, 6, body)
        self.ln(6)

def convert_markdown_to_pdf(markdown_content, pdf_file):
    try:
        print("Generating PDF...")  # Debugging step
        html_text = markdown.markdown(markdown_content)  # Convert markdown to HTML

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)

        # Fallback to text if write_html() isn't supported
        try:
            pdf.write_html(html_text)  # If fpdf.html is installed
        except AttributeError:
            pdf.multi_cell(0, 10, markdown_content)  # Fallback

        pdf.output(pdf_file)
        print(f"PDF created successfully at: {pdf_file}")
        return True
    except Exception as e:
        print(f"Error converting markdown to PDF: {e}")
        return False
    
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
    safe_filename = name.replace(' ', '_').lower() + ".md"
    title = f"Assignment: {name}"
    
    task_description = (
        f"Generate an assignment with the following details:\n"
        f"Name: {name}\n"
        f"Question Types: {question_types}\n"
        f"Number of Questions: {question_count}\n"
        f"Difficulty: {difficulty}\n"
        f"Context (if applicable): {context}\n\n"
        f"IMPORTANT FORMATTING INSTRUCTIONS:\n"
        f"1. Do not use numbered lists for the questions themselves\n"
        f"2. Similar question type should be together (e.g., all multiple choice questions together)\n"
        f"3. Every question should be on a separate line (numbered) and there should be a blank line between questions\n"
        f"4. If providing multiple choice options, use letters (A, B, C, D) without automatic numbering\n"
        f"5. Make sure the markdown is clean and properly formatted\n"
    )
    
    question_generation_task = Task(
        description=task_description,
        expected_output="A set of {question_count} questions matching the criteria with proper markdown formatting",
        agent=question_generator
    )
    
    crew = Crew(
        agents=[question_generator],
        tasks=[question_generation_task],
        verbose=True
    )
    
    result = crew.kickoff()
    questions = result.output if hasattr(result, "output") else str(result)
    
    generate_markdown(safe_filename, title, questions)
    
# Monitor the assignments collection for new inserts
try:
    with collection.watch([{"$match": {"operationType": "insert"}}]) as stream:
        print("Watching for new assignments...")
        for change in stream:
            handle_new_assignment(change["fullDocument"])
except PyMongoError as e:
    print(f"Error while watching collection: {e}")
except Exception as ex:
    print(f"Unexpected error: {ex}")

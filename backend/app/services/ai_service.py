from typing import List, Dict, Any, Optional
import io
import os
from PyPDF2 import PdfReader
import tempfile
from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

from app.core.config import OPENAI_API_KEY, MAX_UPLOAD_SIZE, UPLOAD_DIR

# Initialize OpenAI
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0, model_name="gpt-4o")
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=8000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
    
    async def process_text(self, text: str) -> Dict[str, Any]:
        """Process a text input and generate a summary and key points."""
        try:
            # Split text into chunks if needed
            docs = self.text_splitter.create_documents([text])

            # Create summary
            summary = await self._generate_summary(docs)

            # Extract key points
            key_points = await self._extract_key_points(docs)
 
            return {
                "summary": summary,
                "key_points": key_points,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def process_pdf(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Process a PDF file and extract its content for summarization."""
        try:
            # Save the PDF temporarily
            temp_path = UPLOAD_DIR / filename
            with open(temp_path, "wb") as f:
                f.write(file_content)
            
            # Extract text from PDF
            text = self._extract_text_from_pdf(temp_path)
            
            # Process the extracted text
            result = await self.process_text(text)
            
            # Add source information
            result["source"] = {
                "type": "pdf",
                "filename": filename
            }
            
            return result
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def answer_question(self, query: str, context: str) -> Dict[str, Any]:
        """Answer a question based on the provided context."""
        try:
            # Prepare template for question answering
            template = """
            You are an AI assistant trained to answer questions based on the provided context.
            Use the following context to answer the question.
            
            Context:
            {context}
            
            Question:
            {question}
            
            Answer the question based only on the context provided. If the context doesn't contain the answer, say "I don't have enough information to answer this question."
            """
            
            prompt = PromptTemplate(
                template=template,
                input_variables=["context", "question"]
            )
            
            # Generate answer using the LLM
            input_val = prompt.format(context=context, question=query)
            result = await self.llm.ainvoke(input_val)
            
            return {
                "answer": result,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def _generate_summary(self, docs: List[Document]) -> str:
        """Generate a summary from documents."""
        # Summary chain with custom prompt
        summary_template = """
        Write a concise summary of the following text:
        
        {text}
        
        CONCISE SUMMARY:
        """
        
        prompt = PromptTemplate(template=summary_template, input_variables=["text"])
        
        chain = load_summarize_chain(
            llm=self.llm,
            chain_type="stuff", 
            prompt=prompt
        )
        
        result = await chain.arun(docs)
        return result.strip()
    
    async def _extract_key_points(self, docs: List[Document]) -> List[str]:
        """Extract key points from documents."""
        # Key points extraction prompt
        key_points_template = """
        Extract the 5 most important points from the following text:
        
        {text}
        
        FORMAT: Return ONLY a numbered list of the 5 most important points, with each point separated by newlines.
        """
        
        prompt = PromptTemplate(template=key_points_template, input_variables=["text"])
        
        # Join all documents into a single text
        full_text = " ".join([doc.page_content for doc in docs])
        
        # Generate key points using the LLM
        result = await self.llm.ainvoke(prompt.format(text=full_text))
        
        # Extract content from result if it's an object
        content = result
        if hasattr(result, "content"):
            content = result.content
            
        # Parse the result into a list of key points
        key_points = [point.strip() for point in content.strip().split("\n") if point.strip()]
        
        return key_points
    
    def _extract_text_from_pdf(self, pdf_path) -> str:
        """Extract text from a PDF file."""
        with open(pdf_path, "rb") as f:
            pdf = PdfReader(f)
            text = ""
            for page in pdf.pages:
                text += page.extract_text()
        
        return text

# Create a singleton instance
ai_service = AIService() 
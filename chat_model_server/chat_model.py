import pandas as pd
import numpy as np
import re
import faiss
from sentence_transformers import SentenceTransformer
import dotenv
import os
import weaviate
from weaviate.embedded import EmbeddedOptions
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Weaviate
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
import warnings
from itertools import groupby

warnings.filterwarnings("ignore", category=DeprecationWarning, module="pydantic")


# Cleans and normalizes text by removing HTML tags, extraneous characters, 
# and formal closings, using predefined keywords.
def cleaner(text):
  text = str(text).lower()
  text = re.sub(r"<.*?>", "", text)
  text = re.sub(r'\{.*?\}', '', text)
  text = re.sub(r'&gt|&lt', '', text)
  text = re.sub(r'/p', '', text)
  text = re.sub(r'[\\\xa0]', ' ', text)
  text = re.sub(r'[\\\t]', ' ', text)
  text = re.sub(r'[\\\n]', ' ', text)
  text = text.strip("[]")
  text = text.strip("''")
  text = text.replace('??', ' ')
  text = text.replace("_", "")
  text = re.sub(r"\d{2}/\w{3}/\d{2} \d{1,2}:\d{2} [ap]m;", "", text)
  last_occurrence = -1
  keywords = ['regard', 'cheers', 'best regards', 'sincerely', 'yours sincerely', 'yours faithfully',
              'kind regards', 'warm regards', 'thank you', 'thanks', 'yours truly', 'all the best',
              'take care', 'with appreciation', 'best wishes']
  for keyword in keywords:
    index = text.lower().rfind(keyword)
    if index > last_occurrence:
      last_occurrence = index
  # Extract the content before the last occurrence of keywords
  text = text[:last_occurrence].strip()
  text = text.strip()
  return text


class chatbot_model:

  # Initializes a controller for handling customer-related queries by loading data, 
  # embedding sentences, and creating an indexed search structure.
  def __init__(self, type):

    if type == 'customer':
      # load model
      self.data = pd.read_csv('question_data.csv')
      self.docs = self.data['Description'].to_numpy()
      self.embedder = SentenceTransformer('model')
      # create index for searching
      docs_embeddings = self.embedder.encode(self.docs, convert_to_tensor=True)
      docs_embeddings = docs_embeddings.cpu().numpy()
      self.index = faiss.IndexIDMap(faiss.IndexFlatIP(384))
      self.index.add_with_ids(docs_embeddings, np.arange(len(self.docs)))
      faiss.write_index(self.index, 'docs_index')

  # Searches for the best match to a given question using vector embeddings, 
  # returning the closest answer or a default message if no suitable match is found.
  def Answer(self, question):
    default_answer = 'Sorry, I could not understand your question. If you are looking for general guide, please visit https://opus.nci.org.au/display/Help'
    Descriptions = self.data['Description'].to_numpy()
    Descriptions = np.append(Descriptions, cleaner(input))
    # find the closest answer
    query_vector = self.embedder.encode([question])
    k = 3
    top_k = self.index.search(query_vector, k)
    distances, results = top_k[0], [self.docs[_id] for _id in top_k[1].tolist()[0]]
    result = self.data.loc[self.data['Description'] == results[0]]['Answer'].iloc[0]
    print(result)
    # return default answer if possibility lower than the threshold
    if distances[0][0] < 0.4:
      return default_answer
    return result
  

  #Processes a given question using an advanced retrieval and generation pipeline with OpenAI's LLM, 
  # fetching context-sensitive answers from local text resources.
  def langchain_answer(self, question):
        dotenv.load_dotenv()
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        print(OPENAI_API_KEY)
        # Load and process documents
        loader = TextLoader('./opous_data.txt')
        documents = loader.load()
        text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(documents)

        # Initialize Weaviate client
        client = weaviate.Client("http://localhost:8080", startup_period=100)
        vectorstore = Weaviate.from_documents(
            client=client,
            documents=chunks,
            embedding=OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY),
            by_text=False
        )
        retriever = vectorstore.as_retriever()

        # Set up prompt and model
        template = """You are an assistant for question-answering tasks...
                      please break the answer into 2 paragraphs.
                      if you break the answer into small points,  break the line between the points.
                      Question: {question}
                      Context: {context}
                      Answer:"""
        prompt = ChatPromptTemplate.from_template(template)
        llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0, openai_api_key=OPENAI_API_KEY)
        rag_chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser() 
        )

        # Get the response
        answer = rag_chain.invoke(question)
        print(f"####langchain model Answer method called with question: {question} ")
        return answer

  # Searches for multiple answers to a given question using vector embeddings, 
  # returning a list of relevant answers or a default message if no suitable matches are found above a specified similarity threshold.
  def Multi_Answer(self, question):

    answer = [
      'Sorry, I could not find other answers match your question. If you are looking for general guide, please visit https://opus.nci.org.au/display/Help']

    Descriptions = self.data['Description'].to_numpy()
    Descriptions = np.append(Descriptions, cleaner(input))

    # find the closest answer
    query_vector = self.embedder.encode([question])
    k = 100
    top_k = self.index.search(query_vector, k)

    distances, results = top_k[0], [self.docs[_id] for _id in top_k[1].tolist()[0]]
    for i in range(100):
      result = self.data.loc[self.data['Description'] == results[i]]['Answer'].iloc[0]
      # return default answer if possibility lower than the threshold
      if distances[0][i] > 0.5:
        answer.append(result)
      else:
        break

      new_answer = [x[0] for x in groupby(answer)]
    return new_answer[::-1]
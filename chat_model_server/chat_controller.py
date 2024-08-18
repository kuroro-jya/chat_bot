import chat_model
import re

class chatbot_controller:

  # init method implementing branch
  def __init__(self, type):
    if type == 'customer':
      self.model = chat_model.chatbot_model(type)

  def trythis(self, question):
     return self.model.langchain_answer(question)

  
  # Converts text to HTML, making URLs clickable and preserving paragraphs.
  def html_fitter(self, text):
        result = ""
        text = text.replace('"', "'")
        text_array = text.split('\n\n')

        # Regex to find URLs in the text
        url_pattern = re.compile(r'(https?://[^\s]+)')

        for paragraph in text_array:
            # Replace URLs in the paragraph with clickable links
            paragraph = url_pattern.sub(r'<a href="\1" target="_blank">\1</a>', paragraph)
            result += paragraph + "<br><br>"
        result = result.replace('"', "'")
        return result

  # Handles question responses based on selected mode, using OpenAI or a normal model.
  def Answer(self, question, mode):
        if mode == 'open-ai':
            answer = self.model.langchain_answer(question)
            return self.html_fitter(answer)
        else:
            # normal mode
            return self.html_fitter(self.model.Answer(question))

  # Handles re-answering a question based on the mode and provided index, formatting output for HTML.
  def ReAnswer(self, question, index,mode):
    if mode == 'open-ai':
       answer = self.model.langchain_answer(question)
       return self.html_fitter(answer)
    else:
      answer = self.model.Multi_Answer(question)
      if index > len(answer)-2:
        return answer[-1]
      return answer[index]

  # To be done
  def Feedback(self):
    return 0


# Sends a question to the chatbot controller and returns the response.
def ask_question(question):
  controller = chatbot_controller("customer")
  return controller.Answer(question)

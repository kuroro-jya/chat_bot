import chat_controller
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
controller = chat_controller.chatbot_controller("customer")

# Display your index page
@app.route("/")
def index():
  return render_template('.\public\index.html')


# A function to find answer in the database
@app.route("/find")
def find():
  question = request.args.get('question')
  # role = request.args.get('role')
  mode = request.args.get('mode')
  app.logger.info(f"Find route called with question: {question}")
  print(role)
  return jsonify({"result": controller.Answer(question,mode)})

# A function to find other answers for the question
@app.route("/refind")
def refind():
  question = request.args.get('question')
  # role = request.args.get('role')
  counter = int(request.args.get('counter'))
  mode = request.args.get('mode')
  return jsonify({"result": controller.ReAnswer(question,counter,mode)})

# A function to get feedback from user
@app.route("/feedback")
def feedback():

  question = request.args.get('question')
  response = request.args.get('response')
  # role = request.args.get('role')
  feedback = (request.args.get('feedback'))

  print(question)
  # print(role)
  print(response)
  print(feedback)

  return jsonify({"result": " "})


if __name__ == '__main__':
  app.run('0.0.0.0', port=80)
  
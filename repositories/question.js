const { readFile, writeFile } = require('fs/promises')
const { v4: uuidv4 } = require('uuid')

const makeQuestionRepository = fileName => {
  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)
    return questions
  }

  const getQuestionById = async questionId => {
    const questions = await getQuestions()
    const question = questions.find(question => question.id == questionId)

    if (question) {
      return question
    } else {
      return null
    }
  }

  const addQuestion = async question => {
    const questions = await getQuestions()
    questions.push({ id: uuidv4(), ...question, answers: [] })
    await writeFile(fileName, JSON.stringify(questions))
  }

  const getAnswers = async questionId => {
    const question = await getQuestionById(questionId)

    if (question) {
      return question.answers
    } else {
      return null
    }
  }

  const addAnswer = async (questionId, answer) => {
    const questions = await getQuestions()
    const question = questions.find(question => question.id == questionId)
    question.answers.push({ id: uuidv4(), ...answer })
    await writeFile(fileName, JSON.stringify(questions))
  }

  const getAnswer = async (questionId, answerId) => {
    const question = await getQuestionById(questionId)
    if (!question) return null

    const answer = question.answers.find(answer => answer.id == answerId)
    if (answer) {
      return answer
    } else {
      return null
    }
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    addAnswer,
    getAnswer
  }
}

module.exports = { makeQuestionRepository }

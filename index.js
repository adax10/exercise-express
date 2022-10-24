const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3009

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get('/questions/:questionId', async (req, res) => {
  const question = await req.repositories.questionRepo.getQuestionById(
    req.params.questionId
  )

  if (question) {
    res.json(question)
  } else {
    res.status(404).json({
      message: `Question with id '${req.params.questionId}' doesn't exist`
    })
  }
})

app.post('/questions', async (req, res) => {
  const author = req.body.author
  const summary = req.body.summary

  if (!author || !summary) {
    return res.status(400).json({
      message: `Author and summary are required to add a question`
    })
  }

  await req.repositories.questionRepo.addQuestion({
    author,
    summary
  })
  res.json({ message: 'Question was successfully added' })
})

app.get('/questions/:questionId/answers', async (req, res) => {
  const answers = await req.repositories.questionRepo.getAnswers(
    req.params.questionId
  )

  if (answers) {
    res.json(answers)
  } else {
    res.status(404).json({
      message: `Question with id '${req.params.questionId}' doesn't exist`
    })
  }
})

app.post('/questions/:questionId/answers', async (req, res) => {
  const author = req.body.author
  const summary = req.body.summary

  if (!author || !summary) {
    return res.status(400).json({
      message: `Author and summary are required to add an answer`
    })
  }

  const question = await req.repositories.questionRepo.getQuestionById(
    req.params.questionId
  )

  if (question) {
    await req.repositories.questionRepo.addAnswer(req.params.questionId, {
      author,
      summary
    })
    res.json({
      message: `Answer to question with id '${req.params.questionId}' was successfully added`
    })
  } else {
    res.status(404).json({
      message: `Question with id '${req.params.questionId}' doesn't exist`
    })
  }
})

app.get('/questions/:questionId/answers/:answerId', async (req, res) => {
  const question = await req.repositories.questionRepo.getQuestionById(
    req.params.questionId
  )

  if (question) {
    const answer = await req.repositories.questionRepo.getAnswer(
      req.params.questionId,
      req.params.answerId
    )

    if (answer) {
      res.json(answer)
    } else {
      res.status(404).json({
        message: `Answer with id '${req.params.answerId}' doesn't exist`
      })
    }
  } else {
    res.status(404).json({
      message: `Question with id '${req.params.questionId}' doesn't exist`
    })
  }
})

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})

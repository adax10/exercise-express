const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo

  beforeAll(async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))
    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
  })

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })

  test('should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('should return a list of 2 questions', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
    expect(await questionRepo.getQuestions()).toHaveLength(2)
  })

  test(`shouldn't find a question when the question id doesn't exist`, async () => {
    expect(await questionRepo.getQuestionById('123456')).toBe(null)
  })

  test('should find a question by its id', async () => {
    const questions = await questionRepo.getQuestions()
    const questionId = questions[0].id
    expect(await questionRepo.getQuestionById(questionId)).toMatchObject({
      id: questionId,
      answers: expect.any(Array),
      author: expect.any(String),
      summary: expect.any(String)
    })
  })

  test('should add a new question', async () => {
    const question = {
      author: 'Test',
      summary: 'New testing question'
    }

    await questionRepo.addQuestion(question)
    expect(await questionRepo.getQuestions()).toHaveLength(3)
  })

  test(`shouldn't find answers to the question when the question id doesn't exist`, async () => {
    expect(await questionRepo.getAnswers('123456')).toBe(null)
  })

  test('should find answers to the question by question id', async () => {
    const questions = await questionRepo.getQuestions()
    const questionId = questions[0].id
    const answers = await questionRepo.getAnswers(questionId)
    expect(Array.isArray(answers)).toBe(true)
  })

  test('should add a new answer', async () => {
    const answer = {
      author: 'Answer',
      summary: 'New testing answer'
    }

    const questions = await questionRepo.getQuestions()
    const questionId = questions[0].id

    await questionRepo.addAnswer(questionId, answer)
    expect(await questionRepo.getAnswers(questionId)).toHaveLength(1)
  })

  test(`shouldn't find a specific answer to the question when the question id doesn't exist`, async () => {
    expect(await questionRepo.getAnswer('123', '456')).toBe(null)
  })

  test(`shouldn't find a specific answer to the question when the answer id doesn't exist`, async () => {
    const questions = await questionRepo.getQuestions()
    const questionId = questions[0].id
    expect(await questionRepo.getAnswer(questionId, '456')).toBe(null)
  })

  test('should find a specific answer to the question by question id and answer id', async () => {
    const questions = await questionRepo.getQuestions()
    const questionId = questions[0].id
    const answers = await questionRepo.getAnswers(questionId)
    const answerId = answers[0].id

    expect(await questionRepo.getAnswer(questionId, answerId)).toMatchObject({
      id: answerId,
      author: expect.any(String),
      summary: expect.any(String)
    })
  })
})

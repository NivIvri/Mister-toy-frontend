const toyService = require('./toy.service.js');
const logger = require('../../services/logger.service');
const reviewService = require('../review/review.service');
const { log } = require('../../middlewares/logger.middleware.js');

// GET LIST
async function query(req, res) {
  try {
    var queryParams = req.query;
    const toys = await toyService.query(queryParams)
    res.json(toys);
  } catch (err) {
    logger.error('Failed to get toys', err)
    res.status(500).send({ err: 'Failed to get toys' })
  }
}

// GET BY ID 
async function getToyById(req, res) {
  try {
    const toyId = req.params.id;
    const toy = await toyService.getById(toyId)
    res.json(toy)
  } catch (err) {
    logger.error('Failed to get toy', err)
    res.status(500).send({ err: 'Failed to get toy' })
  }
}

// POST (add toy)
async function addToy(req, res) {
  try {
    const toy = req.body;
    const addedToy = await toyService.add(toy)
    res.json(addedToy)
  } catch (err) {
    logger.error('Failed to add toy', err)
    res.status(500).send({ err: 'Failed to add toy' })
  }
}
// POST (add review)
async function addReview(req, res) {
  try {
    var review = req.body
    review.userId = req.session.user._id
    review = await reviewService.add(review)
    const addedReview = await toyService.addReview(toy.toyId, toy.review)
    res.json(addedReview)
  } catch (err) {
    logger.error('Failed to add toy', err)
    res.status(500).send({ err: 'Failed to add toy' })
  }
}

// PUT (Update toy)
async function updateToy(req, res) {
  try {
    const toy = req.body;
    const updatedToy = await toyService.update(toy)
    res.json(updatedToy)
  } catch (err) {
    logger.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })

  }
}

// DELETE (Remove toy)
async function removeToy(req, res) {
  try {
    const toyId = req.params.id;
    const removedId = await toyService.remove(toyId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove toy', err)
    res.status(500).send({ err: 'Failed to remove toy' })
  }
}

module.exports = {
  query,
  getToyById,
  addToy,
  updateToy,
  removeToy,
  addReview
}

const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
async function query(filterBy = {}) {
    try {

        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')
        //var reviews = await collection.find().toArray()
        reviews = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup:
                {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'toy'
                }
            },
            {
                $unwind: '$toy'
            }
        ]).toArray()
        reviews = reviews.map(review => {
            review.user = { _id: review.user._id, fullname: review.user.fullname, isAdmin: review.user.isAdmin }
            review.toy = { _id: review.toy._id, price: review.toy.price, name: review.toy.name }
            review.createdAt = ObjectId(review._id).getTimestamp()
            return review
        })
        return reviews
    } catch (err) {
        logger.error('cannot find reviews', err)
        throw err
    }

}

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) }
        //if (!isAdmin) criteria.user = ObjectId(userId)
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}


async function add(review) {
    try {
        // peek only updatable fields!
        const reviewToAdd = {
            userId: ObjectId(review.userId),
            toyId: ObjectId(review.toyId),
            txt: review.txt,
            rate: review.rate,
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd;
    } catch (err) {
        logger.error('cannot insert review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    let criteria = {}
    console.log(filterBy, 'filterBy');
    if (filterBy._id || filterBy.userId) {
        if (filterBy._id)
            criteria = { toyId: ObjectId(filterBy._id) }
        else {
            criteria = { userId: ObjectId(filterBy.userId) }
        }
    }

    return criteria
}

module.exports = {
    query,
    remove,
    add
}



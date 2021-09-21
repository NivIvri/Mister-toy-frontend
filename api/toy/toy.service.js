const dbService = require('../../services/db.service.js')
const logger = require('../../services/logger.service.js')
const ObjectId = require('mongodb').ObjectId
const reviewService = require('../review/review.service.js')

async function query(filterBy) {
    try {
        let criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('toy')
        if (filterBy.sort) {
            if (filterBy.sort === 'name')
                var toys = await collection.find(criteria).sort({ name: -1 }).toArray()
            else {
                if (filterBy.sort === 'price')
                    var toys = await collection.find(criteria).sort({ price: -1 }).toArray()

                else if (filterBy.sort === 'date') {
                    var toys = await collection.find(criteria).sort({ date: -1 }).toArray()
                }
            }
        } else {
            var toys = await collection.find(criteria).toArray()
        }
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        let toy = await collection.findOne({ _id: ObjectId(toyId)})
        toy.givenReviews = await reviewService.query({ '_id': (toyId) })
        return toy
    }

    catch (err) {
        //logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ '_id': ObjectId(toyId) })
        return toyId
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        const addedToy = await collection.insertOne(toy)
        return addedToy.ops[0]
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}
async function update(toy) {
    try {
        var id = ObjectId(toy._id)
        delete toy._id
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ "_id": id }, { $set: { ...toy } })
        //mongo retuns pointer
        //toy._id = id
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toyId}`, err)
        throw err
    }
}


module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}



function _makeId(length = 6) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return txt;
}



function _buildCriteria(filterBy) {
    let criteria = {}
    //db.inventory.find( { $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] } )


    if (filterBy.name) {
        const txtCriteria = { $regex: filterBy.name, $options: 'i' }
        criteria = { name: txtCriteria }
    }


    if (filterBy.inStock === 'true') {
        criteria.inStock = true
    }

    if (filterBy.lable !== 'all') {
        criteria.labels =
            { $in: [filterBy.lable] }

    }
    return criteria
}

//db.inventory.find( { $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] } )


//return new Promise((resolve, reject) => {
//    let filterEntities = entities
//    if (!filterBy) return resolve(filterEntities)
//    if (filterBy.name) {
//        const regex = new RegExp(filterBy.name, 'i');
//        filterEntities = filterEntities.filter((entity) => regex.test(entity.name));
//    }
//    if (filterBy.inStock === 'true') {
//        filterEntities = filterEntities.filter((entity) => entity.inStock)
//    }

//    if (filterBy.lable !== 'all') {
//        filterEntities = filterEntities.filter((entity) => entity.labels.includes(filterBy.lable))
//    }
//    if (filterBy.sort) {
//        if (filterBy.sort === 'name')
//            filterEntities.sort((a, b) => a.name.localeCompare(b.name))

//        else {
//            if (filterBy.sort === 'price')
//                filterEntities.sort((a, b) => b.price - a.price)

//            else if (filterBy.sort === 'date') {
//                filterEntities.sort((a, b) => b.createdAt - a.createdAt);
//            }
//        }

//    }
//    resolve(filterEntities)
//})
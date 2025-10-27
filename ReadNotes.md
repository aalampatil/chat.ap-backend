**Notes and some new knowledge for me**

-while deleting using fs ,cb are required if you do normal fs.unlink,if you do not want to add cb just use fs.promises.unlink

<!-- this is a very expensive query for the db -->
    const promises = users.map(async (user) => {
    const messages = await messageModel.find({senderId: user._id, receiverId: userId, seen: false})
    if (messages.length > 0) {
        unseenMessages[user._id] = messages.length
    }
})

<!-- use aggregation pipelines -->
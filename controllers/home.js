const Memo = require('../models/memo.js');
const arrays = require('../models/arrays.js');

exports.getIndex = (req, res) => {
    console.log('Get index...');
    //throw Error('Zero divided')

    let mode;
    if (req.cookies.mode) {
        mode = req.cookies.mode;
    }
    else {
        res.cookie('mode', 'Repeat', { maxAge: 60 * 60 * 24 });
        mode = 'Repeat';
    }

    res.render('index', {
        title: 'Memorizer',
        mode: mode,
        user: req.user
    });
};

exports.getMemos = async (req, res) => {
    try {
        console.log('Get memos...');
        let isRepeat = req.cookies.mode != 'Learn';

        let memos = await Memo.find(
            {
                $and: [
                    { repeatDate: { $lt: new Date() } },
                    { postponeLevel: isRepeat ? { $ne: 0 } : { $eq: 0 } }]
            })
            .sort({ repeatDate: -1 })
            .sort({ postponeLevel: -1 });

        res.send(memos);
    } catch (error) {
        console.error(`Error getting memos: ${error.message}`);
        res.send(`Error getting memos: ${error.message}`);
    }
}

exports.switchMode = (req, res) => {
    let mode = req.params.mode;
    console.log(`Switch mode to ${mode}`);

    res.cookie('mode', mode, { maxAge: 60 * 60 * 24 });
    res.redirect('/Home');
}

exports.postAnswer = async (req, res) => {
    try {
        let id = req.body.id;
        let answer = req.body.answer;
        console.log(`Post answer: '${answer}'`);

        let currentMemo = await Memo.findById(id);

        switch (answer) {
            case 'Bad':
                currentMemo.repeatDate = GetTomorrow();
                currentMemo.postponeLevel = 0;
                currentMemo.scores++;
                break;
            case 'Tomorrow':
                currentMemo.repeatDate = GetTomorrow();
                currentMemo.scores++;
                break;
            case 'Later':
                //currentMemo.RepeatDate = DateTime.Now.AddMinutes(1);
                break;
            case 'Cool':
                var nextPostponeLevel = NextLevel(currentMemo.postponeLevel);
                currentMemo.repeatDate = GetTomorrow(nextPostponeLevel);
                currentMemo.postponeLevel = nextPostponeLevel;
                currentMemo.scores++;
                break;
            default:
                console.error(`Error posting answer: Wrong answer`);
                res.status(400).send(`Wrong answer: ${answer}`);
        }

        await currentMemo.save();
        res.sendStatus(200);
    } catch (error) {
        console.error(`Error posting answer: ${error.message}`);
        res.status(500).send(error.message);
    }
};

exports.update = async (req, res) => {
    try {
        let id = req.body._id;
        let question = req.body.question;
        let answer = req.body.answer;
        let postponeLevel = req.body.postponeLevel;
        let repeatDate = req.body.repeatDate;
        let scores = req.body.scores;
        console.log(`Post update: question: ${question}, answer: ${answer}`);

        await Memo.findByIdAndUpdate(id,
            {
                question,
                answer,
                postponeLevel,
                repeatDate,
                scores
            });
        res.send('Updated!');
    } catch (error) {
        console.error(`Error updating memo: ${error.message}`);
        res.status(500).send(error.message);
    }
};

exports.add = async (req, res) => {
    try {
        let question = req.body.question;
        let answer = req.body.answer;
        console.log(`Post add: question: '${question}', answer: '${answer}'`);

        let memo = new Memo({
            question,
            answer,
            repeatDate: GetTomorrow(0),
            postponeLevel: 0,
            scores: 0
        })

        await memo.save();
        res.send('Added!');
    } catch (error) {
        console.error(`Error adding memo: ${error.message}`);
        res.status(500).send(error.message);
    }
};

exports.delete = async (req, res) => {
    try {
        let id = req.params.id;
        console.log(`Get delete: id: '${id}'`);

        await Memo.findByIdAndRemove(id);
        res.send('Deleted!');
    } catch (error) {
        console.error(`Error deleting memo: ${error.message}`);
        res.status(500).send(error.message);
    }
};

exports.find = async (req, res) => {
    try {
        let key = req.params.key;
        let value = req.params.value;
        console.log(`Get find: key: ${key}, value: ${value}`);

        let memos = await Memo.find(
            {
                $or: [
                    { question: { '$regex': value, '$options': 'i' } },
                    { answer: { '$regex': value, '$options': 'i' } },
                ]
            })
            .lean();
        res.send(memos);
    } catch (error) {
        console.error(`Error finding memo: ${error.message}`);
        res.status(500).send(error.message);
    }
};

function GetTomorrow(add = 1) {
    var tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + add);
    tomorrow.setHours(0, 0, 0, 0);

    return tomorrow;
}

function NextLevel(currentLevel) {
    let index = arrays.postponeLevels.map((lvl) => lvl.Lvl).indexOf(currentLevel) + 1;
    return (arrays.postponeLevels.length == index) ? currentLevel : arrays.postponeLevels[index].Lvl;
}
const Card = require('../models/card');

const serverResponse = {
  badRequest: 400,
  notFound: 404,
  defaultErr: 500,
};

module.exports.getCards = (req, res) => {
  Card.find({}).select('-__v')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(serverResponse.defaultErr).send({ message: err.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(serverResponse.badRequest).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(serverResponse.defaultErr).send({ message: err.message });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.id).select('-__v')
    .orFail(new Error('NotValidId'))
    .then((card) => res.send(`Фотография "${card.name}" удалена!`))
    .catch((err) => {
      if (err.message === 'NotValidId' || err.name === 'CastError') {
        res.status(serverResponse.notFound).send({ message: 'Карточка с указанным _id не найдена.' });
      } else {
        res.status(serverResponse.defaultErr).send({ message: err.message });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.id,
    { $addToSet: { likes: req.user._id } }, { new: true }).select('-__v')
    .orFail(new Error('NotValidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId' || err.name === 'CastError') {
        res.status(serverResponse.badRequest).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else {
        res.status(serverResponse.defaultErr).send({ message: err.message });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.id,
    { $pull: { likes: req.user._id } }, { new: true }).select('-__v')
    .orFail(new Error('NotValidId'))
    .populate('likes', 'name')
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId' || err.name === 'CastError') {
        res.status(serverResponse.badRequest).send({ message: 'Переданы некорректные данные для снятия лайка' });
      } else {
        res.status(serverResponse.defaultErr).send({ message: err.message });
      }
    });
};

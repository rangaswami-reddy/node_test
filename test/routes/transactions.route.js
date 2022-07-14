const router = require("express").Router();
const Transactions = require("../models/transactions.model");
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");

router.post("/create", isAuth, async (req, res) => {
  try {
    const { userId, name, paid, received, payable, receivable } = req.body;

    const transaction = new Transactions({
      userId,
      name,
      paid,
      received,
      payable,
      receivable,
    });
    await transaction.save();
    res.status(201).send({ message: "Transaction created successfully", transaction });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put("/update/:id", isAuth, async (req, res) => {
  try {
    const { name, paid, received, payable, receivable } = req.body;
    const transaction = await Transactions.findByIdAndUpdate(req.params.id, {
      name,
      paid,
      received,
      payable,
      receivable,
    },{new:true});
    res.status(200).send({ message: "Transaction updated successfully", transaction });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
})

router.get("/allTransaction", isAuth, isAdmin, async (req, res) => {
  try {
    const allTransaction = await Transactions.find();
    if (allTransaction) {
    res.status(200).send({
      msg: "All Transaction",
      count: allTransaction.length,
      data: allTransaction,
     });
    }else{
      res.status(404).send({ msg: "No Transaction Found" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

router.get("/allTransaction/:userId", isAuth, async (req, res) => {
  try {
    const allTransaction = await Transactions.find({ user: req.params.userId });
    if (allTransaction) {
    res.status(200).send({
      msg: "All Transaction",
      count: allTransaction.length,
      data: allTransaction,
     });
    }else{
      res.status(404).send({ msg: "No Transaction Found" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

router.get("/:id", isAuth, async (req, res) => {
  try {
    const allTransaction = await Transactions.findById({ _id: req.params.id });
    if (allTransaction) {
    res.status(200).send({
      msg: "Transaction Found",
      data: allTransaction,
     });
    }else{
      res.status(404).send({ msg: "No Transaction Found" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
});

router.post("/totalBill", isAuth, async (req, res) => {
  try {

    const totalPayable = await Transactions.aggregate([{
      $match: {
        'userId': req.body.userId,
        }
      },
      {
        $group: {
          _id: null,
          amount: {
            $sum: "$payable"
          }
        }
      }
    ]);

    const totalReceivable = await Transactions.aggregate([{
      $match: {
        'userId': req.body.userId,
        }
      },
      {
        $group: {
          _id: null,
          amount: {
            $sum: "$receivable"
          }
        }
      }
    ]);

    let payable = 0;
    let receivable = 0;

    if(totalPayable.length > 0 && totalReceivable.length > 0){
      payable = totalPayable[0].amount;
      receivable = totalReceivable[0].amount;
    }else if(totalPayable.length === 0 && totalReceivable.length > 0){
      payable = 0;
      receivable = totalReceivable[0].amount;
    }else if(totalPayable.length > 0 && totalReceivable.length === 0){
      payable = totalPayable[0].amount;
      receivable = 0;
    } else {
      payable = 0;
      receivable = 0;
    }

    res.status(200).send({
      msg: "Total Bill",
      'payable': payable,
      'receivable': receivable,
    });
    
  } catch (error) {
    res.status(400).send({ message: error.message });    
  }
})

module.exports = router;
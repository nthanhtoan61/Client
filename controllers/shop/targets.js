const Target = require("../../models/Target");

const findAllTargets = async (req, res) => {
    try {
      const listOfTargets = await Target.find({});
      res.status(200).json({
        success: true,
        data: listOfTargets,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy dữ liệu từ Products",
      });
    }
};

module.exports = { findAllTargets };
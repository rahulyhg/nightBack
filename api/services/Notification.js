var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    content: String,
    link: Schema.Types.Mixed,
    type: String,
    json: Schema.Types.Mixed,
    modificationTime: Date,
    sendingTime: Date,
    status: Boolean, ///true or false
    image: String,
    typeForApp: String
});

module.exports = mongoose.model('Notification', schema);
var models = {
    saveData: function(data, callback) {
        var project = this(data);
        if (data._id) {
            this.findOneAndUpdate({
                _id: data._id
            }, data, callback);
        } else {
            project.save(function(err, data) {
                if (err) {
                    callback(err, false);
                } else {
                    callback(null, data);
                }
            });
        }
    },
    deleteData: function(data, callback) {
        this.findOneAndRemove({
            _id: data._id
        }, function(err, data) {

            if (err) {
                callback(err, false);
            } else {
                callback(null, data);
            }
        });
    },
    getAll: function(data, callback) {
        this.find().exec(callback);
    },
    getOne: function(data, callback) {
        this.findOne({
            "_id": data._id
        }).exec(callback);
    },
    /////////////////////////////////MOBILE
    getAllMob: function(data, callback) {
        var matchobj = {};
        var matcharr = [];
        if (data.user && data.user != "") {
            User.getOne({
                _id: data.user
            }, function(err, userRespo) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    if (userRespo.notificationSetting && Object.keys(userRespo.notificationSetting).length > 0) {
                        if (userRespo.notificationSetting.event == true) {
                            matcharr.push("Event");
                        }
                        if (userRespo.notificationSetting.photo == true) {
                            matcharr.push("Photo");
                        }
                        if (userRespo.notificationSetting.video == true) {
                            matcharr.push("Video");
                        }
                        if (userRespo.notificationSetting.blog == true) {
                            matcharr.push("Blog");
                        }
                        matchobj = {
                            status: true,
                            $or: [{
                                typeForApp: {
                                    $exists: false
                                }
                            }, {
                                typeForApp: {
                                    $in: matcharr
                                }
                            }]
                        };
                        callMe();
                    } else {
                        callMe();
                    }
                }
            });
        } else {
            matchobj = {
                status: true
            };
            callMe();
        }

        function callMe() {
            var newreturns = {};
            newreturns.data = [];
            data.pagenumber = parseInt(data.pagenumber);
            data.pagesize = parseInt(data.pagesize);
            Notification.find(matchobj, {
                images: 0
            }).sort({
                index: 1
            }).skip(data.pagesize * (data.pagenumber - 1)).limit(data.pagesize).exec(function(err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data2 && data2.length > 0) {
                    newreturns.data = data2;
                    newreturns.totalpages = Math.ceil(data2.length / data.pagesize);
                    newreturns.pageno = data.pagenumber;
                    callback(null, newreturns);
                } else {
                    callback(null, newreturns);
                }
            });
        }
    },
    searchData: function(data, callback) {
        var check = new RegExp(data.search, "i");
        this.find({
            content: {
                '$regex': check
            },
            status: true
        }, {
            _id: 1,
            content: 1
        }, {
            limit: 10
        }, function(err, data2) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data2);
            }
        });
    }
};

module.exports = _.assign(module.exports, models);

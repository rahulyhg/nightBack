/**
 * UploadController
 *
 * @description :: Server-side logic for managing uploads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var process = require('child_process');
var fs = require("fs");
module.exports = {
    index: function(req, res) {
        function callback2(err) {
            Config.GlobalCallback(err, fileNames, res);
        }
        var fileNames = [];
        req.file("file").upload({
            maxBytes: 10000000 // 10 MB Storage 1 MB = 10^6
        }, function(err, uploadedFile) {
            if (err) {
                console.log(err);
                res.json({
                    value: false,
                    data: err
                });
            } else if (uploadedFile && uploadedFile.length > 0) {
                async.each(uploadedFile, function(n, callback) {
                    Config.uploadFile(n.fd, function(err, value) {
                        if (err) {
                            callback(err);
                        } else {
                            fileNames.push(value.name);
                            callback(null);
                        }
                    });
                }, callback2);
            } else {
                callback2(null, {
                    value: false,
                    data: "No files selected"
                });
            }
        });
    },
    readFile: function(req, res) {
        Config.readUploaded(req.query.file, req.query.width, req.query.height, req.query.style, res);
    },
    zipUpload: function(req, res) {
        var reqFile = req.file('file');
        if (req.body && req.body.type && req.body.type != "") {
            var filename = "";
            if (req.body.type == "app") {
                filename = "app2.zip";
                callMe();
            } else if (req.body.type == "back") {
                filename = "back.zip";
                callMe();
            } else if (req.body.type == "api") {
                filename = "api.zip";
                callMe();
            } else {
                reqFile.upload(function() {});
                res.json({
                    value: false,
                    data: "Inavlid Params"
                });
            }

            function callMe() {
                if (req.file('file')._files[0].stream.headers["content-type"] === "application/zip") {
                    req.file("file").upload({
                        maxBytes: 100000000,
                        dirname: "../../zip",
                        saveAs: filename
                    }, function(err, uploadedFile) {
                        if (err) {
                            res.json({
                                value: false,
                                data: err
                            });
                        } else if (uploadedFile && uploadedFile.length > 0) {
                            process.exec("cd zip/ && unzip " + filename, function(err, stdout, stderr) {
                                if (err) {
                                    console.log(err);
                                    res.json({
                                        value: false,
                                        data: err
                                    });
                                } else if (stderr) {
                                    console.log(stderr);
                                    res.json({
                                        value: false,
                                        data: stderr
                                    });
                                } else {
                                    process.exec("cp -r zip/" + filename.split(".")[0] + " newApp/", function(err2, stdout2, stderr2) {
                                        if (err2) {
                                            console.log(err2);
                                            res.json({
                                                value: false,
                                                data: err2
                                            });
                                        } else if (stderr2) {
                                            console.log(stderr2);
                                            res.json({
                                                value: false,
                                                data: stderr2
                                            });
                                        } else {
                                            if (req.body.type == "app" || req.body.type == "back") {
                                                process.exec("rm -rf zip/" + filename + " zip/" + filename.split(".")[0], function(err3, stdout3, stderr3) {
                                                    if (err3) {
                                                        console.log(err3);
                                                        res.json({
                                                            value: false,
                                                            data: err3
                                                        });
                                                    } else if (stderr3) {
                                                        console.log(stderr3);
                                                        res.json({
                                                            value: false,
                                                            data: stderr3
                                                        });
                                                    } else {
                                                        Config.editFolder(req.body, function(err, data) {
                                                            if (err) {
                                                                res.json({
                                                                    value: false,
                                                                    data: err
                                                                });
                                                            } else {
                                                                res.json({
                                                                    value: true,
                                                                    data: "Extraction successful & Copied"
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            } else {
                                                process.exec("rm -rf zip/api.zip zip/api zip/assets zip/config", function(err4, stdout4, stderr4) {
                                                    if (err4) {
                                                        console.log(err4);
                                                        res.json({
                                                            value: false,
                                                            data: err4
                                                        });
                                                    } else if (stderr4) {
                                                        console.log(stderr4);
                                                        res.json({
                                                            value: false,
                                                            data: stderr4
                                                        });
                                                    } else {
                                                        Config.editFolder(req.body, function(err, data) {
                                                            if (err) {
                                                                res.json({
                                                                    value: false,
                                                                    data: err
                                                                });
                                                            } else {
                                                                res.json({
                                                                    value: true,
                                                                    data: "Extraction successful & Copied"
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            res.json({
                                value: false,
                                data: { message: "No files selected" }
                            });
                        }
                    });
                } else {
                    reqFile.upload(function() {});
                    res.json({
                        value: false,
                        data: "Upload only zip"
                    });
                }
            }
        } else {
            reqFile.upload(function() {});
            res.json({
                value: false,
                data: "Please provide params"
            });
        }
    },
    copyFile: function(req, res) {
        var reqFile = req.file('file');
        if (reqFile._files.length > 0) {
            reqFile.upload({
                maxBytes: 10000000,
                dirname: "../../uploads"
            }, function(err, uploadedFile) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else if (uploadedFile && uploadedFile.length > 0) {
                    async.each(uploadedFile, function(n, callback2) {
                        n.fd = n.fd.split('\\').pop().split('/').pop();
                        var split = n.fd.split('.');
                        n.fd = split[0] + "." + split[1].toLowerCase();
                        process.exec("cd uploads && mv " + n.fd + " " + n.filename, function(err, stdout, stderr) {
                            if (stdout) {
                                callback2(null, { message: "Done" });
                            } else {
                                callback2(null, { message: "Done" });
                            }
                        });
                    }, function(err) {
                        if (err) {
                            res.json({
                                value: false,
                                data: err
                            });
                        } else {
                            // res.json({
                            //     value: true,
                            //     data: uploadedFile
                            // });
                            Config.copyFile(req.body, function(err, data2) {
                                if (err) {
                                    console.log("-----------", err);
                                    res.json({
                                        value: false,
                                        data: err
                                    });
                                } else {
                                    process.exec("cd uploads && rm -rf *", function(err1, stdout1, stderr1) {
                                        console.log("Controller", err1);
                                        console.log("Controller", stderr1);
                                        console.log("Controller", stdout1);
                                        res.json({
                                            value: true,
                                            data: "Done"
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            reqFile.upload(function() {});
            res.json({
                value: false,
                data: "Please select file to upload"
            });
        }
    },
    ///////////////////////////MOBILE
    fromApp: function(req, res) {
        function callback2(err) {
            if (err) {
                Config.GlobalCallback(err, fileNames, res);
            } else {
                var updateObj = {};
                if (req.body.image == "true") {
                    updateObj = {
                        _id: req.session.passport.user._id,
                        profilePic: fileNames
                    };
                } else {
                    updateObj = {
                        _id: req.session.passport.user._id,
                        bannerPic: fileNames
                    };
                }
                User.saveMob(updateObj, function(err, updated) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        req.session.passport = { user: updated };
                        req.session.save();
                        res.json({
                            data: "Picture Updated",
                            value: true
                        });
                    }
                });
            }
        }
        var fileNames = [];
        if (req.session.passport && req.body.image && req.body.image != "") {
            req.file("file").upload({
                maxBytes: 10000000 // 10 MB Storage 1 MB = 10^6
            }, function(err, uploadedFile) {
                if (uploadedFile && uploadedFile.length > 0) {
                    async.each(uploadedFile, function(n, callback) {
                        Config.uploadFile(n.fd, function(err, value) {
                            if (err) {
                                callback(err);
                            } else {
                                fileNames.push(value.name);
                                callback(null);
                            }
                        });
                    }, callback2);
                } else {
                    callback2(null, {
                        value: false,
                        data: "No files selected"
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "User not logged-in or Invalid Params"
            });
        }
    },
};

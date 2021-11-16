const fs = require('fs');
const merge = require('deepmerge');
const path = require('path');

function getFileList(path) {
    return fs.readdirSync(path);
}

function mergeJsonFiles(filePath1, filePath2) {
    try {
        delete require.cache[require.resolve(filePath1)];
        delete require.cache[require.resolve(filePath2)];
    } catch (e) { }

    return merge(require(filePath1), require(filePath2));
}

function mergeFilesFromPaths(path1, path2, mergedTranslationPath) {
    var path1FileList = getFileList(path1);
    var path2FileList = getFileList(path2);

    if (!fs.existsSync(mergedTranslationPath)) {
        fs.mkdirSync(mergedTranslationPath, { recursive: true });
    }

    if (path2FileList && path1FileList) {
        for (var ind in path1FileList) {
            var themeFileName = path1FileList[ind];
            var translationFileIndex = path2FileList.findIndex((f) => f == themeFileName);

            var translationFilePath = path.join(path1, themeFileName);

            if (translationFileIndex != -1) {

                var themeTranslationFilePath = path.join(path2, path2FileList[translationFileIndex]);

                var mergedObj = mergeJsonFiles(translationFilePath, themeTranslationFilePath);



                fs.writeFileSync(path.join(mergedTranslationPath, themeFileName), JSON.stringify(mergedObj));
            } else {

            }
        }
    }
}

function getTranslationPath() {
    return translationPath;
}

var translationPath = path.join(__dirname, 'etc/translations/');

module.exports = {
    function(opts) {
        var origTranslationPath = opts.translationPath || translationPath;
        var themeTranslationPath = opts.themeTranslationPath || origTranslationPath;
        var mergedTranslationPath = opts.mergedTranslationPath || path.join(origTranslationPath, 'merged');

        if (!fs.existsSync(themeTranslationPath)) {
            translationPath = origTranslationPath;
            return function (req, res, next) { next() }
        }

        mergeFilesFromPaths(origTranslationPath, themeTranslationPath, mergedTranslationPath);

        fs.watch(origTranslationPath, function (event, filename) {
            if (filename) {
                try {
                    mergeFilesFromPaths(origTranslationPath, themeTranslationPath, mergedTranslationPath);
                } catch (e) { }
            }
        });

        fs.watch(themeTranslationPath, function (event, filename) {
            if (filename) {
                try {
                    mergeFilesFromPaths(origTranslationPath, themeTranslationPath, mergedTranslationPath);
                } catch (e) { }
            }
        });

        translationPath = mergedTranslationPath;

        return function (req, res, next) {
            next()
        }
    },
    getTranslationPath
};
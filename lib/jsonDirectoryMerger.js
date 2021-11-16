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

function mergeFilesFromPaths(path1, path2, mergedPath) {
    var path1FileList = getFileList(path1);
    var path2FileList = getFileList(path2);

    if (!fs.existsSync(mergedPath)) {
        fs.mkdirSync(mergedPath, { recursive: true });
    }

    if (path2FileList && path1FileList) {
        for (var ind in path1FileList) {
            var fileName = path1FileList[ind];

            if (!fileName.toLowerCase().includes('.json')) {
                continue;
            }

            var filePath1 = path.join(path1, fileName);

            if (path2FileList.includes(fileName)) {
                var filePath2 = path.join(path2, fileName);
                var mergedObj = mergeJsonFiles(filePath1, filePath2);
                fs.writeFileSync(path.join(mergedPath, fileName), JSON.stringify(mergedObj));
            } else {
                fs.copyFileSync(filePath1, path.join(mergedPath, fileName));
            }
        }
    }
}

function getMergePath() {
    return jsonPath;
}

var jsonPath;

function init(opts) {
    var directory1 = opts.directory1 || jsonPath;
    var directory2 = opts.directory2 || directory1;
    var mergedPath = opts.mergedPath || path.join(directory1, 'merged');

    if (!fs.existsSync(directory2)) {
        jsonPath = directory1;
        return function (req, res, next) { next() }
    }

    mergeFilesFromPaths(directory1, directory2, mergedPath);

    function watchFunction(event, filename) {
        if (filename) {
            try {
                mergeFilesFromPaths(directory1, directory2, mergedPath);
            } catch (e) { }
        }
    }

    fs.watch(directory1, watchFunction);
    fs.watch(directory2, watchFunction);

    jsonPath = mergedPath;

    return function (req, res, next) { next() }
}

module.exports = {
    init,
    getMergePath
};
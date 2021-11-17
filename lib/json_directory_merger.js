const fs = require('fs');
const merge = require('deepmerge');
const path = require('path');

function get_file_list(path) {
    if (!fs.existsSync(path)) {
        return [];
    }
    return fs.readdirSync(path);
}

function merge_json_files(file_path_1, file_path_2) {
    try {
        delete require.cache[require.resolve(file_path_1)];
        delete require.cache[require.resolve(file_path_2)];
    } catch (e) { console.error(e); }

    return merge(require(file_path_1), require(file_path_2));
}

function merge_files_from_paths(path_1, path_2, merged_path) {
    const path_1_file_list = get_file_list(path_1);
    const path_2_file_list = get_file_list(path_2);

    if (!fs.existsSync(merged_path)) {
        fs.mkdirSync(merged_path, { recursive: true });
    }

    if (path_2_file_list && path_1_file_list) {
        for (const ind in path_1_file_list) {
            const file_name = path_1_file_list[ind];

            if (!file_name.toLowerCase().includes('.json')) {
                continue;
            }

            const file_path_1 = path.join(path_1, file_name);

            if (path_2_file_list.includes(file_name)) {
                const file_path_2 = path.join(path_2, file_name);
                const merged_obj = merge_json_files(file_path_1, file_path_2);
                fs.writeFileSync(path.join(merged_path, file_name), JSON.stringify(merged_obj));
            } else {
                fs.copyFileSync(file_path_1, path.join(merged_path, file_name));
            }
        }
    }
}

function get_merge_path() {
    return json_path;
}

let json_path;

function init(opts) {
    const directory_1 = opts.directory_1 || json_path;
    const directory_2 = opts.directory_2 || directory_1;
    const merged_path = opts.merged_path || path.join(directory_1, 'merged');

    if (!fs.existsSync(directory_2)) {
        json_path = directory_1;
        return function (req, res, next) { next() }
    }

    merge_files_from_paths(directory_1, directory_2, merged_path);

    function watch_func(event, filename) {
        if (filename) {
            try {
                merge_files_from_paths(directory_1, directory_2, merged_path);
            } catch (e) { console.error(e); }
        }
    }

    fs.watch(directory_1, watch_func);
    fs.watch(directory_2, watch_func);

    json_path = merged_path;

    return function (req, res, next) { next() }
}

module.exports = {
    init,
    get_merge_path
};
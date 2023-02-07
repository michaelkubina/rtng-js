/**
 * 
 * RTNG.js is a "Random Text and Number Generator"
 * written by Michael Kubina
 * 
 * https://github.com/michaelkubina/open-scenario-generator
 * 
 * 2023-02-02
 * 
 */
class rtng {

    /**
     * create object and load JSON as promise
     * @param {any} url
     */
    constructor() {
        this.promise;
    }

  adjustExternalTemplatePaths(external, prepend_path) {
      let debug = false;

      console.log(">>> external");
      //console.log(external);

      var elements = Object.keys(external);
      //console.log(elements);

        for (const element of elements) {
            if (typeof (external[element]) == "object" && element != "@sequence") {
                //console.log(element + " is an object");
                console.log(">>> go deeper");
                this.adjustExternalTemplatePaths(external[element], prepend_path);
            }
            else if (element == "@sequence") {
                console.log(element + " is a @sequence");
                //console.log(external[element]);
                for (let idx in external[element]) {
                    let primitive = Object.keys(external[element][idx]);
                    if (primitive == "template") {
                        console.log(external[element][idx]['template']);
                        external[element][idx]['template'] = prepend_path + external[element][idx]['template'];
                        console.log(external[element][idx]['template']);
                    }
                }
            }
        }
    }

    async loadSchema(url) {
        let response = await fetch(url);
        this.promise = await response.json();
    }

    async loadExternal() {
        if (this.promise['@external']) {
            for (let item in this.promise['@external']) {
                let external = await rtng.init(this.promise['@external'][item]);
                let prepend_path = "@external." + item + ".";
                this.adjustExternalTemplatePaths(external['promise'], prepend_path);
                // HIER MUSS IN JEDEM TEMPLATE RECURSIV DER PFAD ERGÄNZT WERDEN UM @external.namespace, DAMIT ES AUFGELÖST WERDEN KANN
                this.promise['@external'][item] = external['promise'];
                //console.log(this.promise);
            }
        }
    }

    static async init(url) {
        const object = new rtng();
        await object.loadSchema(url);
        await object.loadExternal();
        return object;
    }

    /**
     * get the value of an object trough dot.notation and bracket[notation]
     * https://stackoverflow.com/questions/38640072/how-to-get-nested-objects-in-javascript-by-an-string-as-a-bracket-notation
     * @param {any} path
     * @param {any} obj
     */
    getValue(path, obj) {
        let debug = false;

        // start debug
        if (debug) {
            console.log(">>> getValue()");
            console.log("path: " + path);
        }

        let value = path.replace(/\[([^\]]+)]/g, '.$1').split('.').reduce(function (o, p) {
            return o[p];
        }, obj);
        //console.log('Object: ' + obj);
        //console.log(typeof value);
        return value;
    }

    /**
     * checks if element has specific name
     * @param {any} path
     * @param {any} name
     */
    isElement(path, name) {
        // check wether it is .title, .description, .anything etc.
        if (path.endsWith('.' + name)) {
            return true;
        }
        return false;
    }

    /**
     * checks if element is object-element or a value/literal
     * @param {any} path
     */
    async isObject(path) {
        let debug = false;

        // check wether it is new hierarchy
        if (typeof this.getValue(path, await this.promise) === 'object' && Array.isArray(this.getValue(path, await this.promise)) == false) {
            console.log(path + " is object");
            return true;
        }
        if (debug) console.log(path + " is NOT object");

        return false;
    }

    /**
     * checks if element has a @sequence
     * @param {any} path
     */
    isSequence(path) {
        return this.isElement(path, '@sequence');
    }

    /**
     * checks if element has a @external
     * @param {any} path
     */
    isExternal(path) {
        return path.startsWith('@external');
    }

    /**
     * get the value of a element from a path
     * @param {any} path
     */
    async getElement(path) {
        let debug = false;
        if (debug) console.log(this.getValue(path, await this.promise));
        return (this.getValue(path, await this.promise));
    }

    /**
     * returns a path to all elements at the given hierarchy
     * @param {any} path
     */
    async listElements(path) {
        // if empty path, then return keys from highest hierarchy
        if (path === '') {
            return Object.keys(await this.promise);
        }
        let target = this.getValue(path, await this.promise);
        // prevent to list string as indexed array
        if (typeof target === 'string' || target instanceof String) {
            return [];
        } else {
            // get all keys from path
            let allElements = Object.keys(target);
            // add key to path in dot-notation
            allElements.forEach((item, index) => allElements[index] = path + "." + item);
            //console.log(allElements);
            return allElements;
        }
    }

    /**
     * add punctuation and conjunction to list
     * @param {any} list
     * @param {any} punctuation
     * @param {any} conjunction
     */
    applyPunctuation(list, punctuation, conjunction) {
        // abort on empty list or list with only one item
        if (list.length < 2) {
            return list;
        }

        // add puncuation
        if (punctuation) {
            // add punctuation to all elements in array except the two last
            for (let i = 0; i < list.length - 2; i++) {
                list[i] = list[i] + punctuation;
            }
            if (conjunction) {
                // add conjunction before the last
                list.splice(list.length - 1, 0, conjunction);
            } else {
                // if there is no conjunction add punctuation instead 
                list[list.length - 2] = list[list.length - 2] + punctuation;
            }
            return list;
        }
    }

    /**
     * Returns a sorted list of values (lexicographically or numerical)
     * @param {any} list
     * @param {any} sort
     */
    applySort(list, sort) {
        // abort on empty list or list with only one item and when no sorting direction
        if (list.length < 2 || sort == "none") {
            return list;
        }

        // sort string lexicographically and numbers numerically
        if (typeof(list[0]) == "number" && sort == "asc") {
            return list.sort(function (a, b) { return a - b });
        }
        if (typeof (list[0]) == "number" && sort == "desc") {
            return list.sort(function (a, b) { return b - a });
        }
        if (typeof (list[0]) == "string" && sort == "asc") {
            return list.sort();
        }
        if (typeof (list[0]) == "string" && sort == "desc") {
            return list.sort().reverse();
        }
    }

    /**
     * parse a raw object within a @sequence
     * @param {raw} object
     */
    async parseRaw(object) {
        return object.raw + " ";
    }

    /**
     * parse a string object within a @sequence
     * @param {any} object
     */
    async parseString(object) {
        let debug = false;

        // start debug
        if (debug) console.log(">>> BEGIN PARSING STRING");

        // output
        let output = [];

        // defaults
        let min_picks = 1;
        let max_picks;
        let unique = true;
        let sort = "none";
        let punctuation = '';
        let conjunction = '';

        // required
        let number_of_items = await object.string.list.length;

        // optional
        if (await object.string.min_picks >= 0) min_picks = await object.string.min_picks;
        if (await object.string.max_picks >= 1) {
            max_picks = await object.string.max_picks;
        } else {
            max_picks = min_picks;
        }   
        if (typeof (await object.string.unique) == "boolean") unique = await object.string.unique;
        if (await object.string.sort) sort = await object.string.sort;
        if (await object.string.punctuation) punctuation = await object.string.punctuation;
        if (await object.string.conjunction) conjunction = await object.string.conjunction;

        // debug parameters
        if (debug) {
            console.log(await object.string.list);
            console.log("min_picks: " + min_picks);
            console.log("max_picks: " + max_picks);
            console.log("unique: " + unique);
            console.log("sort: " + sort);
            console.log("punctuation: " + punctuation);
            console.log("conjunction: " + conjunction);
        }

        // pick
        let picks = this.getPicks(min_picks, max_picks, 0, number_of_items - 1, 1, unique);
        if (debug) {
            console.log("> picks (index) >");
            console.log(picks);
        }
        for (let i in picks) {
            output.push(object.string.list[picks[i]]);
        }
        if (debug) {
            console.log("> picks (value) >");
            console.log(output);
        }

        // process output
        output = this.processOutput(output, sort, punctuation, conjunction);

        // end debug
        if (debug) console.log("<<< END PARSING STRING");

        return output;
    }

    /**
     * pick random numbers or list indices
     * */
    getPicks(min_picks, max_picks, min, max, steps, unique) {
        let debug = false;

        if (debug) {
            console.log(">>> getPicks()");
            console.log("min_picks: " + min_picks);
            console.log("max_picks: " + max_picks);
            console.log("min: " + min);
            console.log("max: " + max);
            console.log("steps: " + steps);
            console.log("unique: " + unique);
        }

        let result = [];

        // a number between min_picks (inclusive) and max_picks (inclusive)
        let picks = Math.floor(Math.random() * (max_picks - min_picks + 1) + min_picks);
        if (debug) console.log("> picks: " + picks);

        // abort on no picks
        if (!picks) {
            if (debug) console.log("<<< getPicks()");
            return result = [''];
        }

        // random pick (unique or repeatable)
        for (let i = 1; i <= picks; i++) {
            // add random list item
            let random_number;
            if (unique) {
                let unique_pick = false;
                while (!unique_pick) {
                    random_number = Math.floor(Math.random() * ((max - min) / steps)); // random pick
                    random_number = random_number * steps + min;
                    if (result.includes(random_number)) {
                        unique_pick = false; // not necessary
                    } else {
                        result.push(random_number);
                        unique_pick = true;
                    }
                }
            } else {
                random_number = Math.floor(Math.random() * ((max - min) / steps)); // random pick
                random_number = random_number * steps + min;
                result.push(random_number);
            }
        }
        if (debug) console.log("<<< getPicks()");
        return result;
    }

    /**
     * 
     * */
    processOutput(output, sort, punctuation, conjunction) {
        let debug = false;

        // start debug
        if (debug) console.log(">>> processOutput()");

        // sort
        if (sort != "none") {
            output = this.applySort(output, sort);
            if (debug) {
                console.log("> sort >");
                console.log(output);
            }
        }

        // punctuate
        if (punctuation || conjunction) {
            output = this.applyPunctuation(output, punctuation, conjunction);
            if (debug) {
                console.log("> punctuate >");
                console.log(output);
            }
        }

        // join
        output = output.join(' ');
        if (debug) {
            console.log("> join >");
            console.log(output);
        }

        // start debug
        if (debug) console.log("<<< processOutput()");

        return output
    }

    /**
     * parse a number object within a @sequence
     * @param {any} object
     */
    async parseNumber(object) {
        let debug = false;

        // start debug
        if (debug) console.log(">>> BEGIN PARSING NUMBER");

        // output
        let output = [];

        // defaults
        let steps = 1;
        let min_picks = 1;
        let max_picks;
        let unique = true;
        let sort = "asc";
        let punctuation = '';
        let conjunction = '';

        // get required
        let min = await object.number.min;
        let max = await object.number.max;

        // get optional
        if (await object.number.steps > 0) steps = await object.number.steps;
        if (await object.number.min_picks >= 0) min_picks = await object.number.min_picks;
        if (await object.number.max_picks >= 1) {
            max_picks = await object.number.max_picks;
        } else {
            max_picks = min_picks;
        }   
        if (typeof (await object.number.unique) == "boolean") unique = await object.number.unique;
        if (await object.number.sort) sort = await object.number.sort;
        if (await object.number.punctuation) punctuation = await object.number.punctuation;
        if (await object.number.conjunction) conjunction = await object.number.conjunction;

        // debug parameters
        if (debug) {
            console.log("min: " + min);
            console.log("max: " + max);
            console.log("steps: " + steps);
            console.log("min_picks: " + min_picks);
            console.log("max_picks: " + max_picks);
            console.log("unique: " + unique);
            console.log("sort: " + sort);
            console.log("punctuation: " + punctuation);
            console.log("conjunction: " + conjunction);
        }

        // pick
        output = this.getPicks(min_picks, max_picks, min, max, steps, unique);
        if (debug) {
            console.log("> pick >");
            console.log(output);
        }

        // process output
        output = this.processOutput(output, sort, punctuation, conjunction);

        // end debug
        if (debug) console.log("<<< END PARSING NUMBER");

        return output;
    }

    /**
     * parse a @sequence
     * @param {any} path
     */
    async parseSequence(path) { // e.g. rules.hermit_fort.@sequence
        let debug = false;

        let sequence = [];

        if (debug) console.log('Begin parsing @sequence');

        let parsables = await this.listElements(path);
        if (debug) console.log('All parsables:');
        if (debug) console.log(parsables);

        for await (const parsable_item of parsables) {
            if (debug) console.log('Current parsable item:');

            let parsable_element = this.getValue(parsable_item, await this.promise);
            if (debug) console.log(parsable_element);

            //console.log(Object.keys(parsable_element));
            if (Object.keys(parsable_element) == 'raw') {
                if (debug) console.log(parsable_element + ' is a raw');
                sequence.push(await this.parseRaw(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'string') {
                if (debug) console.log(parsable_element + ' is a string');
                sequence.push(await this.parseString(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'number') {
                if (debug) console.log(parsable_element + ' is a number');
                sequence.push(await this.parseNumber(parsable_element));
            }
            else if (Object.keys(parsable_element) == 'template') {
                if (debug) console.log(parsable_element + ' is a template');
                if (debug) console.log(parsable_element.template);
                // TODO: make sure not to fall into infinite loop!!!
                sequence.push(await this.parseSequence(parsable_element.template + '.@sequence'));
            }
        }
        if (debug) console.log('End Parsing @sequence');
        return sequence.join(' ');
    }

    /**
     * checks if a element is a template (= has a @sequence)
     * @param {any} path
     */
    async isTemplate(path) {
        // get a list of paths of all sub-elements for a given path
        let elements = await this.listElements(path);

        // if it's actually a list
        if (Array.isArray(await elements)) {
            // look if it has a @sequenceitem
            for await (const item of elements)
                if (item.endsWith('.@sequence')) {
                    return true;
                }
        }
        return false;
    }

    /**
     * Parse a template from a path, returns the parsed text
     * @param {any} path
     */
    async parseTemplate(path) {
        let debug = false;

        if (debug) console.log('>>> parseTemplate(' + path + ')');

        if (path.startsWith('@external')) {
            console.log("path >> " + path);
            let ext = this.listExternal();
            console.log(ext[0]['promise']);
        }

        // parse sequence if path to template
        else if (await this.isTemplate(path)) {
            return await this.parseSequence(path + '.@sequence');
        }
        
        if (debug) console.log('<<< parseTemplate(' + path + ')');
    }
}
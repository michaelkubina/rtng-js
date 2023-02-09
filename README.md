# rtng-js
## 0.3.1 (2023-02-09)

by Michael Kubina

https://github.com/michaelkubina/rtng-js

## Description

RTNG.js is a lightweight and easy to use random text and number generator, that requires little programming knowledge. Of course it can be used with other libraries as well.

It's core features are:
- primitive text & number types
- custom templates and recursive template calls
- organized in datapacks written in JSON notation
- side-loading of external datapacks (recursive)
- allows for using multiple instances simultaniously
- accessing templates through paths in "dot.notation"
- no dependencies


It can be used for different tasks, where you rely on varying random text and number output, e.g.:
- creating fictive persons
- creating characters
- rolling dices, picking cards, drawing numbers
- game scenario suggestions and challenges
- pseudo reviews
- custom games
- etc.

In order to expand the possibilities further there are planned features like:
- adding datetime type
- adding number range type
- scope of random generation
- outputs being dependend of other template results (e.g. writing gender specific)
- using templates as attributes for other templates
- prevent recursive endless loops from happening
- debugging information
- returning raw values (string, array, int) as well instead/on top of parsed results

## Usage
Using RTNG.js requires a valid datapack following the RTNG.js specific schema in JSON notation. It can be accessed and used through a variety of functions. The simplest way is described in these three steps.

### 1. Add the script to your page

```
<head>
    <script src="rtng-js/rtng.js"></script>
</head>
```

### 2. Load a datapack

```
async function myScript() {
            const example = await rtng.init('https://raw.githubusercontent.com/michaelkubina/rtng-js/main/example.json');
```

### 3. Parse a Template

```
            console.log(await example.parseTemplate("number.any-percent"));
            console.log(await example.parseTemplate("text.favourite-color"));
        }
        myScript();
```

## Create your own RTNG.js datapack
A RTNG.js datapack is for the most part a hierarchical organized tree of templates, that by themselves are constructed from configurable data type primitives. The smallest possible datapack consists of one or more templates not being in any hierarchy at all. A template must have a sequence that should be parsed when called and that indicates, that its actually a template and not part of the hierarchy. A template must not have another hierarchy within it.

```
{
    ...
    "0-to-100": {          <-- a template
        "@sequence":[      <-- because it has a @sequence
            {
                ...
            }
        ]
    },
    ...
    "number": {            <-- a hierarchy, because it does not have a @sequence
        "any-percent": {       <-- a template within a hierarchy
            "@sequence":[      <-- because it has a @sequence
                {
                ...
                }
            ]
        },
    },
    ...
}
```

A `"@sequence"` is a list of configurable data primitive objects. The `@` symbol is required to clearly distinguish it from not being a hierarchy of the name `sequence`. A sequence must not have any other than the allowed RTNG.js data types.

There are currently four primitive data types that have their own set of attributes, through which the output can be configured. The first two main data types are `"number"` and `"string"`, where the former allows for one or more random number picks, and the latter one or more random text snippets from a list.

```
{
    ...
    "0-to-100": {
        "title": "A number from 0 to 100",
        "@sequence": [
            {
                "number": {
                "min": 0,
                "max": 100,
                "min_picks": 1
                }
            }
        ]
    },
    "3-colors": {
        "title": "Three colors from a list of ten",
        "@sequence": [
            {
                "string": {
                    "list": [
                        "red",
                        "green",
                        "blue",
                        "yellow",
                        "cyan",
                        "magenta",
                        "purple",
                        "pink",
                        "black",
                        "white"
                        ],
                    "min_picks": 2,
                    "max_picks": 4,
                    "unique": true,
                    "punctuation": ",",
                    "conjunction": "and"
                }
            }
        ]
    },
```

The other two data type are `"raw"`, which is used for a direct string output, and most importantly the `"template"` data type. This allows for parsing another template directly into the template, that is currently being processed.

Adding a template means actually just writing the absolute path in `dot.notation` to another template within the datapack. The use of `dot.notation` for the names of your templates or hierarchies is not allowed, as it will break things. For readability benefits the use of `kebab-case` is encouraged instead.

```
    "number": {
        "any-percent": {
            "@sequence":[
                {
                    "template": "0-to-100"
                },
                {
                    "raw": "%"
                }
            ]
        },
    },
    "text": {
        "favourite-color": {
            "@sequence":[
                {
                    "raw": "Let me think about it... I am"
                },
                {
                    "template": "number.any-percent"
                },
                {
                    "raw": "sure that"
                },
                {
                    "template": "3-colors"
                },
                {
                    "raw": "are my favourite colors!"
                }
            ]
        }
    }
}
```

You are allowed to enrich the datapack with your JSON data as long as you follow the notation rules. This way you will not break things and will be able to retrieve the data through some RTNG.js functions as well.

```
{
    "metadata": {
        "title": "example.json",
        "author": "Michael Kubina",
        "description": "a small example datapack for RTNG.js",
        ...
    },
    ...
}
```

For a detailed overview of the functions and an in depth view on the data types, please visit the [documentation](https://github.com/michaelkubina/rtng-js/tree/main/docs).

## version history

### 0.3.1
- add initial documentation

### 0.3.0
- change initialization method to static async factory function
- add sideloading of external datapacks
- add punctuation, conjunction and sorting options to number and string primitives
- add some factory datapacks
- update README.md
- update example datapack

### 0.2.x
- add README.md
- add number, string, raw and template primitives
- add pick options to number and string primitives
- add example datapack

### 0.1.x
- experimenting
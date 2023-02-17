# RTNG.js Documentation

In order to understand how RTNG.js works, we need to look at some design elements and how they interact.

## Datapack
A RTNG.js datapack is just a JSON file, that holds all the information necessary for random text and number generation. You can think of a datapack as the database as well as a way to set the necessary parameters for processing this data.

### External datapacks
It is possible to sideload external datapacks into your datapack by referencing them in the `@external` (reserved name) hierarchy. The property name equals the later hierarchical path of the external datapack, while the reference itself is just the `URL` to the resource. If external datapacks depend on other external datapacks as well, those dependencies get resolved automatically. 

Example
```
"@external": {
	"trees": "https://example.com/trees.json",
	"colors": "https://otherexample.com/other/paint.json"
}
```

### Paths
Access to data is based on its path in `dot.notation` while each property can be written in any other case. RTNG.js uses `hyphen-case` for its examples and factory datapacks. When sideloading external datapacks its also possible to directly access templates by prepending the hierarchy and namespace.

Example
```
"@external.trees.hierarchy-name.template-name"
"@external.trees.@external.plant-deseases.hierarchy-name.template-name"
"animals.mammals.mice.template-name"
"metadata.author"
"some-hierarchy.names"
```

### Hierarchies
You can organize the data within your datapack in hierarchies. Hierarchies are simply JSON objects for storing more hierarchies or ultimatly templates. Its possible to store custom metadata in hierarchies as well.

Example
```
"animals": {
	"mammals": {
		"mice": {
			...
		}
	}
}
```

### Templates (object)
A template is a special JSON object that has the `@sequence` (reserved name) property and should be at the lowest branch of any hierarchy. A `@sequence` is an array of data type objects, that will be parsed sequentially and typically returns a simple or complex random generated text or number. Its possible call other templates objects through the template data type.

Example
```
"names": {
	"title": "A simple name generator",
	"description": "Pick a firstname and a lastname"
    "@sequence": [
		{
			"string": {
				[
					"Arthur",
					"Lisa",
					"Jerry",
					"Anne"
				]
			}
		},
		{
			"string": {
				[
					"Brown",
					"Smith",
					"Hunter",
					"Young"
				]
			}
		}
	]
}
```

Output
- `Anne Young`
- `Jerry Smith`
- `Anne Smith`
- `...`

Example
```
"person-likes-sweets": {
	"title": "<Person> likes sweets",
	"description": "A phrase stating a random person likes sweets"
    "@sequence": [
		{
			"template": "some-hierarchy.names"
		},
		{
			"raw": "likes sweets"
		}
	]
}
```

Output
- `Lisa Brown likes sweets`
- `Jerry Hunter likes sweets`
- `Anne Young likes sweets
- `...`

### Metadata
While its not required to add metadata to your datapacks, its encouraged to at least provide a `"title"` and optionally a `"description"` to each hierarchy or template. RTNG.js uses both those properties as explaination in its examples and factory datapacks, while descriptive metadata of the file itself is organized in the `@metadata` (reserved name) hierarchy.

Example
```
"@metadata": {
	"author": "Firstname Lastname",
	"title": "weather.json"
	"description": "a datapack that allows for detailed weather description"
}
```

## Data Types
Currently there are three data types, that can be used in a templates (object) `@sequence` as building blocks for random text and number generation. Those are `string`, `number` and the `template` (data type). Data types can be configured through parameters, while only a limited amount of parameters is mandatory. Since a `@sequence` is an array of data type objects, you need to encapsulate each data type in `{}` when used. What type is returned depends on the data type and the parameters provided.

### String
A `string` data type allows for picking a string from a list or passthrough of a string. The output is typecast to string in every circumstance, so that other primitives that might have been provided will get returned as strings as well.

A single string is used for direct ouput and is written between quotes.

Example
```
{
	"string": "Alea iacta est"
}
```
Output
- `Alea iacta est`

A list of strings is used for random picking from this list. This makes it possible to quickly expand a single string to a pickable string. Without any parameters you will always pick exactly one item from the list.

Example
```
{
	"string": [ "Alea iacta est", "God does not play dice" ]
}
```
Output
- `Alea iacta est`
- `God does not play dice`

To adjust the picking behaviour or to join the results with delimiters, several parameters can be applied:

- `min_picks` sets how many items should be picked at least (`default: 1`)
- `max_picks` sets how many items should be picked at most (`default: min_picks)
- `unique` sets wether the repeated picking of the same item should be forbidden (`default: true`)
- `sort` sets wether the output is sorted lexicographically ascending `asc` or descending `desc` or not at all (`default: none`)
- `punctuation` sets a seperator character or phrase between the items of the enumaration, except when there's a `conjunction`, then theres this one will be applied between the last two instead (`default: ''`)
- `conjunction` sets a seperator character or phrase between the last two items of the enumaration or if there are only two picked items, then in between them (`default: ''`)

Example
```
{
	"string": {
		[
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
		
		"min_picks": 0,
		"max_picks": 4,
		"unique": true,
		"sort": "none"
		
		"punctuation": ",",
		"conjunction": "and"
	}
}
```

Output
- `red, black and magenta`
- `cyan`
- `pink and yellow`
- `black, white, green and cyan`
- `...`
- with `"min_picks": 0` its possible to have no output as well

### Number
A `number` data type allows for picking one or more random numbers within a `min` to `max` range, a single number or from a list of numbers. The output will be returned as number primitives or typecast to numbers. When punctuation or conjunction is used in the parameters, then inevitably a string will be returned.

A single number will likely not be used very often:

Example
```
{
	"number": 3.14159265359
}
```

Output
- `3.14159265359`

A list of numbers allows for uneven distribution or custom sets and will always pick exactly one item, if no parameters are provided.

Example
```
{
	"number": [2, 3, 3, 4, 4, 5]
}
```

Output
- `2`
- `4`
- `...`

Numbers can be configured in a way, that you can pick a number from an evenly distributed range of numbers with a fixed distance between them. In order to utilize it, it is required to provide a specific configuration object:

- `min` is a mandatory parameter of the configuration object and sets the minimum of the range
- `max` is a mandatory parameter of the configuration object and sets the maximum of the range
- `steps` sets how far individual numbers are apart from each other (`default: 1`)

If there are no other parameters, then exactly one number will be picked.

Example
```
{
	"number": {
		"min": -100,
		"max": 100
	}
}
```

Output
- `57`
- `-4`
- `13
- `...`

To adjust the picking behaviour or to join the results with delimiters, several parameters can be applied:

- `min_picks` sets how many items should be picked at least (`default: 1`)
- `max_picks` sets how many items should be picked at most (`default: min_picks`)
- `unique` sets wether the repeated picking of the same item should be forbidden (`default: true`)
- `sort` sets wether the output is sorted numerically ascending `asc` or descending `desc` or not at all (`default: none`)
- `punctuation` sets a seperator character or phrase between the items of the enumaration, except when there's a `conjunction`, then theres this one will be applied between the last two instead (`default: ''`)
- `conjunction` sets a seperator character or phrase between the last two items of the enumaration or if there are only two picked items, then in between them (`default: ''`)

Example
```
{
	"number": {
		"min": -100,
		"max": 100,
		"steps": 5,
		}
		
	"min_picks": 3,
	"max_picks": 3,
	"unique": true,
	"sort": "asc",
	
	"punctuation": ",",
	"conjunction": "or"
}
```

Output
- `-65, 15 or 30`
- `-70, -50 or 45`
- `-35, 75 or 90`
- `...`

### Template (data type)
A `template` data type calls a template object through its path and outputs its value. The template object can either be a single path or a list of paths.

Example:
```
{
	template: "@external.trees.hierarchy-name.template-name"
}
```

Output
- `Oak`
- `Maple`
- `...`
# RTNG.js Documentation

In order to understand how RTNG.js works, we need to look at some design elements and how they interact.

## Datapack
A RTNG.js datapack is just a JSON file, that holds all the information necessary for random text and number generation. You can think of a datapack as the database as well as a way to set parameters on how to process the data within it.

### External datapacks
It is possible to sideload external datapacks into your datapack by referencing them in the `@external` hierarchy. The property name equals the later hierarchical path of the external datapack, while the reference itself is just the `URL` to the resource. If external datapacks depend on other external datapacks as well, those dependencies get resolved automatically.

Example
```
"@external": {
	"trees": "https://example.com/trees.json",
	"colors": "https://otherexample.com/other/paint.json"
}
```

### Paths
Access to data is based on its path in `dot.notation` while each property can be written in any other case. RTNG.js uses `hyphen-case` for its examples and factory datapacks. When working with external datapacks its also possible to directly access further external resources, that those external datapacks might require.

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
A template is a special JSON object that has the `@sequence` property and should be at the lowest branch of any hierarchy. A `@sequence` is an array of data types objects, that will be parsed sequentially and typically returns a simple or complex random generated text. Its possible call other templates objects through the template data type.

Example
```
"names": {
	"title": "A simple name generator",
	"description": "Pick a firstname and a lastname"
    "@sequence": [
		{
			"string": {
				"list": [
					"Arthur",
					"Lisa",
					"Jerry",
					"Anne"
				]
			}
		},
		{
			"string": {
				"list": [
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
"person-likes-mice": {
	"title": "Person likes a certain mice",
	"description": "A phrase stating a random person likes mice"
    "@sequence": [
		{
			"template": "some-hierarchy.names"
		},
		{
			"raw": "likes mice"
		}
	]
}
```

Output
- `Lisa Brown likes mice`
- `Jerry Hunter likes mice`
- `Anne Young likes mice`
- `...`

### Metadata
While its not required to add metadata to your datapacks, its encouraged to at least provide a `"title"` and optionally a `"description"` to each hierarchy or template. RTNG.js uses both those properties for documentation purposes in its examples and factory datapacks, while descriptive metadata of the file itself is organized in the `"metadata"` hierarchy.

Example
```
"metadata": {
	"author": "Firstname Lastname",
	"title": "weather.json"
	"description": "a datapack that allows for detailed weather description"
}
```

## Data Types
Currently there are four data types, that can be used in a template objects `@sequence` for random text and number generation. Those are `raw`, `string`, `number` and the `template` (not to be mistaken with the template object). Most data types can be configured through parameters, while only a limited amount of parameters is mandatory. Since a `@sequence` is an array of data type objects, you need to encapsulate each data type in `{}` when used.

### Raw
A `raw` data type is simply a direct string or number output when there is no need for any random generation.

Example
```
{
	"raw": "Alea iacta est"
}
```

Output
- `Alea iacta est`

### String
A `string` data type allows for random picking a string or number from a given list array of any length. The property expects a parameter object with the required data and configuration.

- `list` is the only mandatory parameter and requires at least one item to pick from.
- `min_picks` sets how many items should be picked at least (`default: 1`)
- `max_picks` sets how many items should be picked at most (`default: min_picks)
- `unique` sets wether the repeated picking of the same item should be forbidden (`default: true`)
- `sort` sets wether the output is sorted lexicographically ascending or descending or not at all (`default: none`)
- `punctuation` sets a seperator character or phrase between the items of the enumaration, except the last two (`default: ''`)
- `conjunction` sets a seperator character or phrase between the last two items of the enumaration (`default: ''`)

Example
```
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
A `number` data type returns one or more random numbers within a `min` to `max` range. The property expects a parameter object with the required data and configuration.

- `min` is a mandatory parameter and sets the minimum of the range
- `max` is a mandatory parameter and sets the maximum of the range
- `steps` sets the how far individual numbers are apart from each other
- `min_picks` sets how many items should be picked at least (`default: 1`)
- `max_picks` sets how many items should be picked at most (`default: min_picks`)
- `unique` sets wether the repeated picking of the same item should be forbidden (`default: true`)
- `sort` sets wether the output is sorted numerically ascending or descending or not at all (`default: none`)
- `punctuation` sets a seperator character or phrase between the items of the enumaration, except the last two (`default: ''`)
- `conjunction` sets a seperator character or phrase between the last two items of the enumaration (`default: ''`)

Example
```
{
	"number": {
		"min": -100,
		"max": 100,
		"steps": 5,
		"min_picks": 3,
		"max_picks": 3,
		"unique": true,
		"sort": "true",
		"punctuation": ",",
		"conjunction": "or"
	}
}
```

Output
- `-65, 15 or 30`
- `-70, -50 or 45`
- `-35, 75 or 90`
- `...`

### Template (data type)
A `template` data type calls another template object through its path and outputs its value. The template objects 

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
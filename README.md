# cli-lit

Tool for building command-line interface (CLI) applications for Node.js

## Installation

```bash
$ npm i cli-lit
# or
$ yarn add cli-lit
```

## Usage

**_Input:_**

```js
#!/usr/bin/env node

import { cli } from 'cli-lit';

const prog = cli('my-cli');

prog.version('1.1.3').option('--global, -g', 'An example global flag');

prog
	.command('transform <src> <dest>')
	.describe('Transform the source file. Expects a *.js entry file.')
	.example('transform index.js out.js')
	.example('transform index.js out.js --global')
	.action((src, dest, opts) => {
		console.log(`Transforming ${src} to ${dest}`);
		console.log('↪ These are extra opts', opts);
	});

prog.parse(process.argv);
```

**_Output:_**

```a
$ my-cli --help

  Usage
    $ my-cli <command> [options]

  Available Commands
    transform    Transform the source file.

  For more info, run any command with the `--help` flag
    $ my-cli transform --help

  Options
    -g, --global     An example global flag
    -v, --version    Displays current version
    -h, --help       Displays this help message

---

$ my-cli build --help

  Description
    Transform the source file.
    Expects a *.js entry file.

  Usage
    $ my-cli transform <src> <dest> [options]

  Options
    -g, --global    An example global flag
    -h, --help      Displays this help message

  Examples
    $ my-cli transform index.js out.js
    $ my-cli transform index.js out.js --global
```

## Considerations

- Define your global/program-wide version, options, description, and/or
  examples first.<br>
  Once you define a CLI command, you can't access the global-scope again.

- Define your commands and options in the order that you want them to appear.<br>
  `cli-lit` will not mutate or sort your CLI for you. Global options print
  before local options.

* Usage text will always append `[options]` & `--help` and `--version` are done
  for you.

* Help text sections (example, options, etc) will only display if you
  provide values.

## Subcommands

`cli-lit` supports subcommands out of the box. They are defined and parsed like
any other command. When defining their [`usage`](#usage-1), everything up until
the first argument (`[arg]` or `<arg>`) is interpreted as the command string.

It is _not_ necessary to define the subcommand's "base" as an additional
command.

```js
const prog = cli('cloud');

// This command definition is not necessary for the following subcommands
// to work. However, it's recommended that you define it first for better
// visibility.
prog
	.command('auth')
	.describe('Authenticate with the cloud service.')
	.action(opts => {
		console.log('↪️ Print available users');
	});

prog.command('auth login <name>', 'Demo...').action((name, opts) => {
	console.log(`↪️ Login user '${name}'`);
});

prog.command('auth logout <name>', 'Demo...').action((name, opts) => {
	console.log(`↪️ Logout user '${name}'`);
});
```

## Single Command Mode

You may only need `cli-lit` for a single-command CLI application.
To enable this, you may make use of the [`isSingle`](#issingle) argument.
Doing so allows you to pass the program's entire [`usage` text](#usage-1) into
the `name` argument.

With "Single Command Mode" enabled, your entire binary operates as one command.
This means that any [`prog.command`](#progcommandusage-desc-opts) calls are
disallowed and will instead throw an Error.

Of course, you may still define a program version, a description, an example,
and declare options. You are customizing the program's attributes as a whole.

### Example

```js
cli('serve [dir]', true)
	.version('1.0.0')
	.describe('Run a static file server')
	.example('public -qeim 31536000')
	.example('--port 8080 --etag')
	.example('my-app --dev')
	.option('-D, --dev', 'Enable "dev" mode')
	.option('-e, --etag', 'Enable "Etag" header')
	// There are a lot...
	.option('-H, --host', 'Hostname to bind', 'localhost')
	.option('-p, --port', 'Port to bind', 5000)
	.action((dir, opts) => {
		// Program handler
	})
	.parse(process.argv);
```

## API

### cli(name, isSingle)

Returns: `Program`

Returns your chainable `cli` instance, which we'll refer to as Program (or
`prog`) in this document.

#### name

Type: `String`<br>
Required: `true`

The name of your `Program` / CLI.

#### isSingle

Type: `Boolean`<br>
Default: `false`

Sets the Program to [Single Command Mode](#single-command-mode).

When `true`, this simplifies your generated `--help` output such that:

- the "root-level help" is your _only_ help text
- the "root-level help" does not display an `Available Commands` section
- the "root-level help" does not inject `$ name <command>` into the `Usage`
  section
- the "root-level help" does not display
  `For more info, run any command with the '--help' flag` text

You may customize the `Usage` of your command by modifying the `name` argument
directly.

> **Important:** Whenever `name` includes a custom usage, then `isSingle`
> is automatically assumed and enforced!

### prog.command(usage, description, options)

Creates a new Command for your `Program`.  
All configuration methods (`prog.describe`, `prog.action`, ...) will apply to
this Command until another Command has been created.

#### usage

Type: `String`

The usage pattern for your current Command.
This will be included in the general or command-specific `--help` output.

- **Required** arguments are wrapped with `<` and `>` characters
- **Optional** arguments are wrapped with `[` and `]` characters

All arguments are positionally important, which means they are passed to your
current Command's [`handler`](#handler) function in the order that they were
defined.

Optional arguments that don't receive a value will be `undefined` in your
[`handler`](#handler) function.

> **Important:** You **must** define required arguments **before** optional
> arguments.

#### description

Type: `String`<br>
Default: `''`

The Command's description.
The value is passed directly to [`prog.describe`](#progdescribetext).

#### options

Type: `Object`<br>
Default: `{}`

##### opts.alias

Type: `String|Array`

Optionally define one or more aliases for the current Command.<br>
When declared, the `opts.alias` value is passed directly to the
[`prog.alias`](#progaliasnames) method.

##### opts.default

Type: `Boolean`

Manually set/force the current Command to be the Program's default command.
This ensures that the current Command will run if no command was specified.

> **Important:** If you run your Program without a Command _and_ without
> specifying a default command, your Program will exit with a
> `No command specified` error.

### prog.describe(text)

Add a description to the current Command.

#### text

Type: `String|Array`

The description text for the current Command. This will be included in the
general or command-specific `--help` output.

Internally, your description will be separated into an `Array` of sentences.

For general `--help` output, only the first sentence will be displayed.<br>
However, all sentences will be printed for command-specific `--help` text.

### prog.alias(...names)

Define one or more aliases for the current Command.

An error will be thrown if:<br>

1. the program is in [Single Command Mode](#single-command-mode) or<br>
2. `prog.alias` is called before any `prog.command`

#### names

Type: `String`

The list of aliases for the current Command.<br>
For example, you may want to define shortcuts and/or common typos for the
Command's full name.

The `prog.alias()` is append-only, so calling it multiple times within a
Command context will _keep_ all aliases, including those initially passed
via [`opts.alias`](#optsdefault).

### prog.action(handler)

Attach a callback to the current Command.

#### handler

Type: `Function`

The function to run when the current Command is executed.<br>
Its parameters are based (positionally) on your Command's [`usage`](#usage-1)
definition.

All options, flags, and extra/unknown values are included as the last parameter.

### prog.example(string)

Add an example for the current Command.

#### string

Type: `String`

The example string to add. This will be included in the general or
command-specific `--help` output.

> **Note:** Your example's `str` will be prefixed with your Program's [`name`](#name).

### prog.option(flags, description, value)

Add an Option to the current Command.

#### flags

Type: `String`

The Option's flags, which may optionally include an alias.<br>
You may use a comma (`,`) or a space (` `) to separate the flags.

#### description

Type: `String`

The description for the Option.

#### value

Type: `String`

The **default** value for the Option.<br>
Flags and aliases, if parsed, are `true` by default.

### prog.version(string)

The `--version` and `-v` flags will automatically output the Program version.

#### string

Type: `String`<br>
Default: `0.0.0`

The new version number for your Program.

### prog.parse(argv, options)

Parse a set of CLI arguments.

#### argv

Type: `Array`

Your Program's `process.argv` input.

> **Important:** You don't need to `.slice(2)` your `process.argv` input! This
> is done for you.

#### options

Type: `Object`<br>
Default: `{}`

Additional `process.argv` parsing config which will override any internal
values.

#### opts.unknown

Type: `Function`<br>
Default: `undefined`

Callback to run when an unspecified option flag has been found.

Your handler will receive the unknown flag (string) as its only argument.<br>
You may return a string, which will be used as a custom error message.
Otherwise, a default message is displayed.

#### opts.lazy

Type: `Boolean`<br>
Default: `false`

If true, your Program will not immediately execute the `action` handler.
Instead, `parse()` will return an object of `{ name, args, handler }` shape,
wherein the `name` is the command name, `args` is all arguments that would be
passed to the action handler, and `handler` is the function itself.

### prog.help(command)

Manually display the help text for a given command.<br>
If no command name is provided, the general/global help is printed.

Your general and command-specific help text is automatically attached to the
`--help` and `-h` flags.

> **Note:** You don't have to call this directly! It is automatically done for
> you when you run `bin --help`

#### command

Type: `String`<br>
Default: `null`

The name of the command for which to display help.
Otherwise displays the general help.

## Development

(1) Install dependencies

```bash
$ npm i
# or
$ yarn
```

(2) Run initial validation

```bash
$ ./Taskfile.sh validate
```

(3) Start developing. See [`./Taskfile.sh`](./Taskfile.sh) for more tasks to
help you develop.

---

_This project was set up by @jvdx/core_

[install-node]: https://github.com/nvm-sh/nvm

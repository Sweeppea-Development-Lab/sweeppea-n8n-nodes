# ✨ Code Style Guide - Sweeppea Development Team

In our team, there are several fundamental aspects that **must be strictly followed** to ensure clean, readable, and maintainable code.

## APP       : N8N Nodes (part of Sweeppea Suite)
## Framework : Vue2 with Vuetify2
## Backend   : NodeJS

## 🔥 Very Important Rule

It is important to detect whether the project is built in Vue2 with Vuetify2 or Vue3 with Vuetify3 since the APIs and the way of assembling the components, props, etc., are different, always respect the existing structure to avoid generating too much noise in the existing code.

## General Rules

1. **Indentation**  
	- Use **TAB indentation** throughout the code.  

2. **Hybrid Indentation System**
	- We follow a hybrid indentation approach used in critical systems like the Linux kernel and NASA's aerospace systems:
		- **TABs for left margin indentation**: Use tabs to indent code from the left margin, representing the logical structure of code.
		- **Spaces for alignment within lines**: Use spaces for aligning elements within the same line (like operators, values, or comments).
	- This approach separates logical structure from visual alignment, improving readability and maintainability.

### ✅ Example of Hybrid Indentation  

```javascript
/* TABs for indentation, spaces for alignment */
function example() {
	const shortVar = 1;
	const longerVariable   = 2;
	const veryLongVariable = 3;
}
```

Visual representation:
```
|[TAB] const shortVar = 1;
|[TAB] const longerVariable[space][space][space] = 2;
|[TAB] const veryLongVariable = 3;
| <- left margin
```

3. **Spacing (Oxygen in the code)**  
	- Code must be **well-spaced** to improve readability.  
	- Not respecting code aesthetics is considered disrespectful.

### ✅ Example of Well-Spaced Code  

```javascript
  
/* Load User Settings and Set Theme */
const loadUserSettings = async () => {

	const authStore = useAuthStore();

	if (authStore.isAuthenticated) {

		try {

			/* Call API */
			const response = await axiosInstance.get(`/api/settings/fetchSettings`);

			if (response.data.Response) {
				
				const settings = response.data.Settings;
				
				authStore.setTheme(settings.Theme);
			}

		} catch (error) {
			
			console.error(`Failed to load user settings:`, error);
		}
	}
};
```

4. **Comments**  
	- **Code can never have too many comments.**  
	- **All comments must be in English, without exception.**  

5. **Variables definitions**
	- **Always use camelCase**
	- **Always name the variable in English**

## Required Header for `.js` Files

Every `.js` file must begin with the following header, customized with the corresponding information:  

```javascript
/*
     ___
    / __|_ __ _____ ___ _ __ _ __  ___ __ _
    \__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
    |___/\_/\_/\___\___| .__/ .__/\___\__,_|
                        |_|  |_|

    Platform  : Sweeppea <replace_with_app_name> (i.e: Renaissance)
    Version   : 4.0
    Path      : /<replace_with_folder>/<replace_with_file_name>.js

    (c) Sweeppea, all rights reserved.
*/
```

## Comment Standards  

### Inline Comments (not used frequently)
```javascript
const example = 'example'; // Comment
```

### Line Comments (preferred method)
- **Always include a blank line above.**  

```javascript
/* Created */
async created() {

	/* Load Rows Per Page (always use title case) */
	this.loadRowsPerPage();

	/* Sync Selected Prospect (always use title case) */
	this.selectedAdminLogs = await this.localDB.getItem('selectedAdminLogs');

	/* Fetch All Admins (always use title case) */
	this.fetchAdmins();

	if (this.selectedAdminLogs) {

		/* Fetch All Logs */
		this.fetchAllLogs();
	}
}
```

### Comments for Important Sections or Endpoints (always include in backend)
```javascript
/*
 * Endpoint Used To Fetch All Boards (always use title case)
 */
```

## Functions, Classes, Methods

Always explain (very summarized) what a function, class, method... does above (with docustring), in a summarized way, even if it lives in an external file, explain the arguments, what they receive, what they return, and everything that happens in it.

## Component Structure and Lifecycle  

When you find one of these structures in a `.vue` file, **do not remove them**. They are essential references for the team.  

### Component Structure
```javascript
/* Component Structure
/
	Name
	Components
	Data
	Watch
	Computed
	Methods
	Lifecycle Hooks
*/
```

### Component Lifecycle (always maintain these)
```javascript
/* Component Lifecycle
/
	beforeCreate()
	created()
	beforeMount()
	mounted()
	beforeUpdate()
	updated()
	beforeDestroy()
	destroyed()
*/
```

## MongoDB Model Conventions  

1. **Keys in MongoDB models must use PascalCase (capitalized).**  
2. **Internal objects must also follow this convention.**  

### ✅ Correct Example (spacing and alignment are important for readability)
```javascript
/* Data Collection Schema */
const DataSchema = mongoose.Schema({
	Type: {
		type     : String,
		required : true,
	},
	Value: {
		type     : String,
		required : true,
	},
	UpdatedAt: {
		type     : Date,
		default  : Date.now,
	}
});
```

### ❌ Incorrect Example  
```javascript
/* Data Collection Schema */
const DataSchema = mongoose.Schema({
	type: {
		type: String,
		required: true,
	},
	value: {
		type: String,
		required: true,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	}
});
```

## Object Key Conventions  

- **All keys within objects must begin with a capital letter (PascalCase).**  
- This facilitates reading and maintains consistency with database models.  

### ✅ Correct Example  
```javascript
const UserSettings = {
	Theme      : `dark`,
	Language   : `en`,
	DebugMode  : true,
	MaxRetries : 5
};
```

### ❌ Incorrect Example  
```javascript
const userSettings = {
	theme: "dark",
	language: "en",
	debugMode: true,
	maxRetries: 5
};
```

## Column Alignment in Objects  

- **Colons (`:`) and assignment operators (`=`) must be vertically aligned.**  
- This **improves readability** and makes data structures easier to identify.  

### ✅ Correct Example  
```javascript
const settings = {
	Theme      : `dark`,
	Language   : `en`,
	DebugMode  : true,
	MaxRetries : 5
};
```

### ❌ Incorrect Example  
```javascript
const settings = {
	Theme: "dark",
	Language: "en",
	DebugMode: true,
	MaxRetries: 5
};
```

## Function Arguments

- **Function arguments must begin with an underscore (`_`).**
- Exceptions: Reserved words or conventional names like `error`, `response`, `req`, `res`, etc.

### ✅ Correct Example (leave space between lines)
```javascript
function calculateTotal(_items, _taxRate) {

	return _items.reduce((sum, item) => sum + item.price, 0) * (1 + _taxRate);
}

/* Exception for conventional names */
function handleApiResponse(error, response) {

	if (error) {

		console.error(`API Error:`, error);
		
		return;
	}
}
```

### ❌ Incorrect Example (lines are cramped together, which is wrong)
```javascript
function calculateTotal(items, taxRate) {
	return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
}
```

## Additional Guidelines

### General Guidelines

**Language Consistency**: All code, comments, variable names, and documentation must be in English without exceptions.

**Spelling and Comment Clarity**: Comments should be concise, accurate, and meaningful. For example, change "/* retrun user data */" to "/* Return User Data */".

**Code Spacing**: Ensure code is not cramped. Add blank lines between logical blocks:

```javascript
/* Incorrect (cramped) */
if (payload.MobilePhone.length < 10) {
	payload.MobilePhone = payload.MobilePhone.trim().replace(/\s/g, '');
}

/* Correct (spaced) */
if (payload.MobilePhone.length < 10) {

	payload.MobilePhone = payload.MobilePhone.trim().replace(/\s/g, '');
}
```

**Object Property Alignment**: Align property names and values for visual harmony:

```javascript
/* Create New User */
const newUser = new Users({
	UserToken                   : payload.UserToken,
	FullName                    : payload.FullName,
	Email                       : payload.Email,
	MobilePhone                 : payload.MobilePhone || '',
	Password                    : await MyFunctions.hashPassword(payload.Password),
	Status                      : false,
	VerificationToken           : verificationToken,
	VerificationTokenExpiration : verificationExpiration,
	EmailVerified               : false,
	UserType                    : 1 // Explicitly set UserType to 1 (Instakes User)
});
```

**Semicolon Usage**: Every statement must end with a semicolon (;):

```javascript
/* Incorrect */
const error = ref(null)
const admins = ref([])

/* Correct */
const error  = ref(null);
const admins = ref([]);
```

**CSS Style and Aligments (frontend)**

### ✅ Correct Example
```css
.rainbow-text {
	display                 : inline-block;
	font-weight             : bold;
	background              : linear-gradient(to right, navy, green, lime, orange, pink, crimson, salmon, gold,  cyan, blue, purple);
	background-clip         : text;
	-webkit-background-clip : text;
	color                   : transparent;
	background-size         : 200% 100%;
	animation               : rainbowText 2s linear forwards;
}

.chat-input-container {
	display          : flex;
	justify-content  : center;
	padding          : 16px;
	background-color : #f4f4f5; /* Some comment */
	border-top       : 1px solid #e0e0e0; /* Another comment */
}
```

### ❌ Incorrect Example
```css
.rainbow-text {
	display: inline-block;
	font-weight: bold;
	background: linear-gradient(to right, navy, green, lime, orange, pink, crimson, salmon, gold,  cyan, blue, purple);
	background-clip: text;
	-webkit-background-clip: text;
	color: transparent;
	background-size: 200% 100%;
	animation: rainbowText 2s linear forwards;
}

.chat-input-container {
	display: flex;
	justify-content: center;
	padding: 16px;
	background-color: #f4f4f5; /* Some comment */
	border-top: 1px solid #e0e0e0; /* Another comment */
}
```

### Backend (Node.js)

**Route Documentation**: Above every Node.js route, include a comment explaining its purpose:

```javascript
/*
 * Endpoint Used To Reset Password With Token
 */
router.post('/reset-password', limiter, async (_req, _res) => {

	// Route logic
});
```

**Response Format**: For every `return` statement that sends a response, add a comment indicating whether it returns `TRUE` or `FALSE`:

```javascript
/* Return FALSE */
return _res.status(200).json({
	Response : false,
	Message  : `User registration is currently disabled.`
});
```

**Security Checks**: Avoid exposing sensitive data like API keys or database passwords. Use environment variables instead.

**Optimization**: Use efficient methods for loops, array operations, and data processing.

**Optimization**: Use workers, threads or any kind of parallelism -if needed- to optimize processes, code and/or mongo queries as much as possible.

### Frontend (Vue2 or Vue3 with Vuetify)

**Component Structure**: Ensure Vue components follow a clear structure with distinct `<template>`, `<script>`, and `<style>` sections.

**Reactivity**: Use proper reactivity patterns according to Vue version (refs/reactive in Vue3, data/computed in Vue2).

**Vuetify Usage**: Follow Vuetify best practices for components, props, slots, and styling.

**Event Handling**: Document event listeners and emitters with comments.

### Database Operations

**MongoDB Optimization**:
  - Use indexes for frequently queried fields
  - Limit fields in `find` operations with projections
  - Use aggregation pipelines for complex operations
  - Use atomic operators for updates

**Error Handling**: Implement robust error handling:

```javascript
try {
	
	const user = await Users.findById(_userId);
	
	if (!user) throw new Error('User not found');

} catch (_error) {

	/* Return FALSE */
	return _res.status(404).json({
		Response : false,
		Message  : `Error: ${_error.message}`
	});
}
```

### Best Practices

**Comment Quality**: Use title case for comments:
  - Incorrect: `/* if no coordinates, return empty string */`
  - Correct: `/* If No Coordinates, Return Empty String */`

**Code Duplication**: Avoid repeating code blocks; refactor into reusable functions.

**Design Principles**: Follow single responsibility, modularity, and DRY principles.

## Example Application

Original code vs. improved code following our guidelines:

**Original Code:**
```javascript
router.post('/login', async (req, res) => {

	const user = await Users.findOne({Email: req.body.email})

	if (!user) {
		
		return res.status(404).json({Response: false, Message: "User not found"})
	}
});
```

**Improved Code:**
```javascript
/*
 * Endpoint Used To Authenticate User
 */
router.post('/login', async (_req, _res) => {

	const user = await Users.findOne({ Email: _req.body.email });

	if (!user) {

		/* Return FALSE */
		return _res.status(404).json({
			Response : false,
			Message  : `User not found`
		});
	}
});
```

### Column Aligment when =

### ❌ Incorrect Example
```javascript
errorMessage = `Validation error: ${error.message}`;
statusCode = 400;
```

### ✅ Correct Example
```javascript
errorMessage = `Validation error: ${error.message}`;
statusCode   = 400;
```

### Added Rule (block or code analisys)

When you're instructed to review just a backend path, a specific block of code, or a function, analyze it thoroughly line by line and suggest changes using modern, structured, and optimized syntax, while also considering security considerations.

## Code Simplification and Compression

It's important to always look for alternatives when writing code to keep the final build as small as possible. Keep in mind that most of this code, especially in the front-end, is loaded and executed in the client's browser, and we often don't know if they have powerful computers.

## Importing Libraries Efficiently

### Conditional Imports

To optimize performance and prevent unnecessary library loading, use **dynamic imports** for functions or routes that are not frequently used. Before applying this approach, analyze the file to determine if it's necessary. If a module is used multiple times, it's generally best to load it in the **global scope**. However, for functions that require a library only within their execution, import it inside the function, as shown in the example below:

```javascript
async function loadFile1(_path) {

	const fs = await import('node:fs');

	return fs.readFileSync(path, 'utf8');
}

async function loadFile2(_path) {

	const fs = await import('node:fs');

	return fs.readFileSync(path, 'utf8');
}
```

### When to Use `process.nextTick()`

Use `process.nextTick()` only when necessary. If it can **positively impact performance**, suggest its use. This is particularly relevant in scenarios where deferring execution until the next event loop iteration prevents unnecessary blocking.

### Best Practices for Library Loading

- **Prevent unnecessary imports** by only loading libraries where needed.
- **Global scope imports** are recommended when a library is used across multiple functions or routes.
- **Local scope imports** should be used when a library is only required within a specific function or route that is **not frequently called**.

## Amazon SDK Usage

Always use **Amazon SDK for JavaScript (v3)**. Many of our applications still use **v2**, but the recommendation is to migrate to **v3** whenever possible. If necessary, suggest **refactoring** code to comply with this rule.

## Custom Instructions (important)

- DO NOT create new files, scripts, docs, tests... unless explicitly requested.
- DO NOT generate documentation of any kind unless explicitly requested.
- DO NOT create unit tests or any other type of tests unless explicitly requested.
- DO NOT install, delete or update npm libraries unless explicitly requested.
- If I ask you to send me an email, ALWAYS use AWS SES (using the AWS CLI), or MCP if available.

When working with MongoDB or Mongoose:

- Always ensure backward compatibility.
- Prioritize performance optimizations while maintaining compatibility with previous versions.

When working with JavaScript:

- Always write standard, compatible code.
- Avoid experimental or non-standard syntax unless explicitly required.

If you need to understand how a library, framework or feature works:

- Do not hesitate to search for resources and official documentation on the internet.
- VERY IMPORTANT: For everything related to the AWS account, always use the AWS CLI (console) with current credentials.

### **IMPORTANT:**
By adhering to these instructions, you will produce code that is secure, efficient, maintainable, and aligned with modern development standards. Provide detailed feedback and suggestions for every issue identified, ensuring the user understands the reasoning behind each change. Let's take care of our code quality! 🚀

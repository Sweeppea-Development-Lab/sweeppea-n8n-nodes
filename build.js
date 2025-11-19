#!/usr/bin/env node

/*
	Simple TypeScript to JavaScript transpiler for N8N nodes
	This bypasses the zod library version incompatibility issue
*/

const fs = require('fs');
const path = require('path');

/* Clean and create dist directories */
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
	fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(distDir, 'nodes', 'Sweeppea'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'credentials'), { recursive: true });

/* Transpile Sweeppea.node.ts */
console.log('Transpiling Sweeppea.node.ts...');
const sweeppeaTs = fs.readFileSync('nodes/Sweeppea/Sweeppea.node.ts', 'utf8');
let sweeppeaJs = sweeppeaTs
	.replace(/^import\s+{[^}]+}\s+from\s+'[^']+';?\n?/gm, '')
	.replace(/export class Sweeppea implements INodeType/g, 'class Sweeppea')
	.replace(/:\s*INodeTypeDescription/g, '')
	.replace(/async execute\(this:\s*IExecuteFunctions\)/g, 'async execute()')
	.replace(/:\s*Promise<INodeExecutionData\[\]\[\]>/g, '')
	.replace(/:\s*INodeExecutionData\[\]/g, '')
	.replace(/:\s*IDataObject/g, '')
	.replace(/:\s*string/g, '')
	.replace(/as\s+string/g, '')
	.replace(/as\s+IDataObject/g, '')
	.replace(/new NodeOperationError\(/g, 'new n8n_workflow_1.NodeOperationError(');

sweeppeaJs = '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.Sweeppea = void 0;\nconst n8n_workflow_1 = require("n8n-workflow");\n' + sweeppeaJs.replace(/^\/\*/, '/*') + '\nexports.Sweeppea = Sweeppea;\n';
fs.writeFileSync('dist/nodes/Sweeppea/Sweeppea.node.js', sweeppeaJs);

/* Transpile SweeppeaApi.credentials.ts */
console.log('Transpiling SweeppeaApi.credentials.ts...');
const credentialsTs = fs.readFileSync('credentials/SweeppeaApi.credentials.ts', 'utf8');
let credentialsJs = credentialsTs
	.replace(/^import\s+{[^}]+}\s+from\s+'[^']+';?\n?/gm, '')
	.replace(/export class SweeppeaApi implements ICredentialType/g, 'class SweeppeaApi')
	.replace(/:\s*INodeProperties\[\]/g, '')
	.replace(/:\s*IAuthenticateGeneric\s*=/g, ' =')
	.replace(/:\s*string/g, '').replace(/:\s*number/g, '').replace(/:\s*boolean/g, '');

credentialsJs = '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.SweeppeaApi = void 0;\n' + credentialsJs.replace(/^\/\*/, '/*') + '\nexports.SweeppeaApi = SweeppeaApi;\n';
fs.writeFileSync('dist/credentials/SweeppeaApi.credentials.js', credentialsJs);

/* Copy static files */
console.log('Copying static files...');
fs.copyFileSync('nodes/Sweeppea/Sweeppea.node.json', 'dist/nodes/Sweeppea/Sweeppea.node.json');
fs.copyFileSync('nodes/Sweeppea/sweeppea.svg', 'dist/nodes/Sweeppea/sweeppea.svg');

/* Verify syntax */
console.log('Verifying JavaScript syntax...');
const { execSync } = require('child_process');
try {
	execSync('node -c dist/nodes/Sweeppea/Sweeppea.node.js', { stdio: 'pipe' });
	execSync('node -c dist/credentials/SweeppeaApi.credentials.js', { stdio: 'pipe' });
	console.log('✅ Build completed successfully!');
} catch (error) {
	console.error('❌ Syntax error detected');
	console.error(error.stderr?.toString() || error.message);
	process.exit(1);
}

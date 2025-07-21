"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
if (!process.env.SERVICE_ACCOUNT_KEY_FILE)
    throw new Error('SERVICE_ACCOUNT_KEY_FILE environment variable is not set.');
if (!process.env.FOLDER_ID)
    throw new Error('FOLDER_ID environment variable is not set.');
if (!process.env.DISCORD_WEBHOOK_URL)
    throw new Error('DISCORD_WEBHOOK_URL environment variable is not set.');
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var adm_zip_1 = __importDefault(require("adm-zip"));
var drive_functions_1 = require("./drive-functions");
var child_process_1 = require("child_process");
var hook_discord_1 = require("./hook-discord");
var axios_1 = __importDefault(require("axios"));
var os_1 = require("os");
var SERVER_ZIP_FILENAME = 'server.zip';
var SERVER_DIR = path_1.default.join(__dirname, '..', 'server');
var SERVER_ZIP_PATH = path_1.default.join(__dirname, '..', SERVER_ZIP_FILENAME);
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var files, serverFile, fileStream, writeStream, fileZip;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting server setup...');
                    console.log('Deleting local server directory if it exists...');
                    deleteLocalServer();
                    console.log('Fetching latest server updates from Google Drive...');
                    return [4 /*yield*/, (0, drive_functions_1.getFileList)()];
                case 1:
                    files = _a.sent();
                    if (files.length === 0) {
                        console.log('No files found in Google Drive. Exiting setup.');
                        return [2 /*return*/];
                    }
                    serverFile = files.find(function (file) { return file.name === SERVER_ZIP_FILENAME; });
                    if (!serverFile) {
                        console.log("No server file found with name ".concat(SERVER_ZIP_FILENAME, ". Exiting setup."));
                        return [2 /*return*/];
                    }
                    console.log("Found server file: ".concat(serverFile.name, " (ID: ").concat(serverFile.id, ")"));
                    return [4 /*yield*/, (0, drive_functions_1.downloadFile)(serverFile.id)];
                case 2:
                    fileStream = _a.sent();
                    writeStream = fs_1.default.createWriteStream(SERVER_ZIP_PATH);
                    fileStream.pipe(writeStream);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            writeStream.on('finish', function () { return resolve(''); });
                            writeStream.on('error', reject);
                        })];
                case 3:
                    _a.sent();
                    console.log('Server file downloaded successfully.');
                    console.log('Setting up local server directory...');
                    fileZip = new adm_zip_1.default(SERVER_ZIP_PATH);
                    fileZip.extractAllTo(path_1.default.join(__dirname, '..'), true);
                    console.log('Server files extracted successfully.');
                    if (fs_1.default.existsSync(SERVER_ZIP_PATH)) {
                        fs_1.default.unlinkSync(SERVER_ZIP_PATH);
                        console.log('Temporary server zip file deleted.');
                    }
                    console.log('Local server setup completed successfully.');
                    console.log('Starting local server...');
                    return [4 /*yield*/, startServer()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function deleteLocalServer() {
    console.log('Deleting local server directory:', SERVER_DIR);
    if (fs_1.default.existsSync(SERVER_DIR))
        fs_1.default.rmSync(SERVER_DIR, { recursive: true, force: true });
    console.log('Local server directory deleted:', SERVER_DIR);
}
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var ip, server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get('https://api.ipify.org?format=json')];
                case 1:
                    ip = (_a.sent()).data.ip;
                    server = (0, child_process_1.spawn)('java', ['-Xmx6G', '-Xms4G', '-jar', 'server.jar', 'nogui'], {
                        cwd: SERVER_DIR,
                        stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr = pipes (valor padrão)
                    });
                    server.stdout.on('data', function (chunk) { return process.stdout.write(chunk); });
                    server.stderr.on('data', function (chunk) { return process.stderr.write(chunk); });
                    process.stdin.pipe(server.stdin);
                    process.on('SIGINT', function () {
                        console.log('\nEnviando comando "stop" ao servidor…');
                        server.stdin.write('stop\n');
                        server.once('close', function () { return function () { return saveServerAndExit(); }; });
                        setTimeout(function () {
                            console.log('Servidor não respondeu ao comando "stop". Forçando a saída.');
                            (0, hook_discord_1.hookDiscord)('Ocorreu um erro ao salvar o servidor. Por favor, envie as alterações manualmente.\nO usuário ' +
                                (0, os_1.userInfo)().username +
                                ' tentou salvar alterações mas ocorreu um erro. Envie as alterações manualmente.', 'Erro ao Salvar Servidor');
                            process.exit(1);
                        }, 4 * 60 * 1000);
                    });
                    console.log("Servidor iniciado (IP p\u00FAblico: ".concat(ip, "). Digite comandos abaixo:"));
                    return [2 /*return*/];
            }
        });
    });
}
function saveServerAndExit() {
    return __awaiter(this, void 0, void 0, function () {
        var zip, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 5]);
                    zip = new adm_zip_1.default();
                    zip.addLocalFolder(SERVER_DIR);
                    zip.writeZip(SERVER_ZIP_FILENAME);
                    console.log('Server files zipped successfully.');
                    return [4 /*yield*/, (0, drive_functions_1.uploadZipFile)(SERVER_ZIP_FILENAME, fs_1.default.createReadStream(SERVER_ZIP_FILENAME))];
                case 1:
                    _a.sent();
                    console.log('Server zip file uploaded successfully.');
                    return [4 /*yield*/, (0, hook_discord_1.hookDiscord)('O servidor foi salvo com sucesso e atualizado no Google Drive.\nO usuário ' + (0, os_1.userInfo)().username + ' Salvou novas alterações.', 'Servidor Salvo')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Erro ao salvar alteração do servudir, envie as alteraçõe manualmente:');
                    return [4 /*yield*/, (0, hook_discord_1.hookDiscord)('Ocorreu um erro ao salvar o servidor. Por favor, envie as alterações manualmente.\nO usuário ' +
                            (0, os_1.userInfo)().username +
                            ' tentou salvar alterações mas ocorreu um erro. Envie as alterações manualmente.', 'Erro ao Salvar Servidor')];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
main();

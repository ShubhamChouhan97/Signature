const argsMap = new Map();
const args = process.argv.slice(2);

argsMap.set('unnamed', []);

for (let index = 0; index < args.length; index++) {
    let currentArg = args[index];
    if (currentArg.startsWith('--')) {
        currentArg = currentArg.replace('--', '');
        const argValue = args[index + 1];
        if (currentArg === 'unnamed') {
            argsMap.get('unnamed').push(argValue);
        } else {
            argsMap.set(currentArg, argValue);
        }
        index++;
        continue;
    }
    argsMap.get('unnamed').push(currentArg);
}

export default argsMap;
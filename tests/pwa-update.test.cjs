const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function updatePage() {
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const boot = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
        .map(match => match[1]).find(source => source.includes('offerUpdate'));
    assert.ok(boot, 'Exercise the actual production update handler');
    const listeners = {}, registrationListeners = {}, workerListeners = {};
    const buttons = [], messages = [], toasts = [];
    let saveCalls = 0, saveResult = { ok: true };
    const registration = {
        waiting: { postMessage: message => messages.push(message.type) },
        installing: { addEventListener: (type, callback) => { workerListeners[type] = callback; } },
        addEventListener: (type, callback) => { registrationListeners[type] = callback; }
    };
    const context = {
        document: {
            addEventListener() {},
            getElementById: id => buttons.find(button => button.id === id),
            createElement: () => ({ disabled: false }),
            body: { appendChild: button => buttons.push(button) }
        },
        navigator: { serviceWorker: {
            controller: {}, addEventListener() {},
            register: () => Promise.resolve(registration)
        } },
        location: { hostname: 'election.example', reload() {} },
        window: {
            addEventListener: (type, callback) => { listeners[type] = callback; },
            GameEngine: { state: {} },
            SaveStore: { save: () => { saveCalls++; return saveResult; } },
            GameUI: { showToast: (...args) => toasts.push(args) }
        },
        console
    };
    vm.runInNewContext(boot, context);
    listeners.load();
    await Promise.resolve();
    return {
        buttons, messages, toasts, context, registration,
        repeatNotification() { registrationListeners.updatefound(); workerListeners.statechange(); },
        setSaveResult(result) { saveResult = result; },
        get saveCalls() { return saveCalls; }
    };
}

test('waiting-worker notifications create one update button and do not overwrite an unloaded save', async () => {
    const page = await updatePage();
    for (let i = 0; i < 4; i++) page.repeatNotification();
    assert.equal(page.buttons.length, 1);
    assert.equal(page.buttons[0].type, 'button');
    page.buttons[0].onclick();
    page.buttons[0].onclick();
    assert.deepEqual(page.messages, ['APPLY_UPDATE']);
    assert.equal(page.saveCalls, 0);
    assert.equal(page.buttons[0].disabled, true);
});

test('an update requires a successful active-game checkpoint and can retry a failed save', async () => {
    const page = await updatePage();
    page.context.window.GameEngine.state.playerCandidate = { id: 'whitmer' };
    page.setSaveResult({ ok: false, reason: 'Storage is full' });
    page.buttons[0].onclick();
    assert.equal(page.saveCalls, 1);
    assert.equal(page.messages.length, 0);
    assert.equal(page.buttons[0].disabled, false);
    assert.equal(page.toasts[0][0], 'Storage is full');
    page.setSaveResult({ ok: true });
    page.buttons[0].onclick();
    page.buttons[0].onclick();
    assert.equal(page.saveCalls, 2);
    assert.deepEqual(page.messages, ['APPLY_UPDATE']);
});

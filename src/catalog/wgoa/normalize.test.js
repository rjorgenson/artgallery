const normalize = require('./normalize');

test('Empty title remains empty', () => {
    expect(normalize.title('')).toBe('');
});

test('Title is converted to title case', () => {
    expect(normalize.title('this is a test')).toBe('This Is A Test');
});

test('Empty artist remains empty', () => {
    expect(normalize.artist('')).toBe('');
});

test('Artist is converted to start case', () => {
    expect(normalize.artist('Lenny BRUCE')).toBe('Lenny Bruce');
});

test('Artist last name is last', () => {
    expect(normalize.artist('BRUCE, Lenny')).toBe('Lenny Bruce');
});

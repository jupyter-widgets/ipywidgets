const widgetsRendered = new Promise((resolve, reject) => {
    setTimeout(() => reject(Error('timeout waiting for widgets to render')), 5000); // 5s timeout

    const listener = () => {
        resolve();
        document.removeEventListener('widgetsRendered', listener);
    };
    document.addEventListener('widgetsRendered', listener);
});

describe('index.html', function() {
    this.timeout(10000);

    beforeEach(() => {
        return widgetsRendered;
    });

    describe('textArea', () => {
        it('exists', () => {
            expect(document.querySelector('textarea')).to.be.ok;
        });
        it('correct value', () => {
            expect(document.querySelector('textarea').value).to.equal('test <b>text</b>');
        });
    });
    describe('html', () => {
        it('exists', () => {
            expect(document.querySelector('div.widget-html')).to.be.ok;
        });
        it('correct value', () => {
            expect(document.querySelector('div.widget-html-content').innerHTML).to.equal('test <b>text</b>');
        });
    });
});

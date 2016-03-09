const widgetsRendered = new Promise((resolve, reject) => {
    setTimeout(function() { reject(Error('timeout waiting for widgets to render')) }, 5000); // 5s timeout

    const listener = function() {
        resolve();
        document.removeEventListener('widgetsRendered', listener);
    };
    document.addEventListener('widgetsRendered', listener);
});

describe('index.html', function() {
    this.timeout(10000);

    beforeEach(function() { return widgetsRendered; });

    describe('textArea', function() {
        it('exists', function() {
            expect(document.querySelector('textarea')).to.be.ok;
        });
        it('correct value', function() {
            expect(document.querySelector('textarea').value).to.equal('test <b>text</b>');
        });
    });
    describe('html', function() {
        it('exists', function() {
            expect(document.querySelector('div.widget-html')).to.be.ok;
        });
        it('correct value', function() {
            expect(document.querySelector('div.widget-html').innerHTML).to.equal('test <b>text</b>');
        });
    });
});

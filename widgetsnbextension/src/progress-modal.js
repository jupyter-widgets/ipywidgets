// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

"use strict";

function ProgressModal() {
    this._backdrop = document.createElement('div');
    this._backdrop.classList.add('widget-modal-backdrop');
    this._backdrop.classList.add('widget-modal-hidden');
    var textContainer = document.createElement('div');
    textContainer.classList.add('widget-modal-text');
    var spinner = document.createElement('i');
    spinner.className = "fa fa-cog fa-spin";
    textContainer.appendChild(spinner);
    this._text = document.createElement('div');
    this._text.innerText = 'Rendering widgets...';
    textContainer.appendChild(this._text);
    this._backdrop.appendChild(textContainer);
    var progressBar = document.createElement('div');
    progressBar.classList.add('progress');
    progressBar.classList.add('widget-modal-progress');
    this._backdrop.appendChild(progressBar);
    this._progressbar = document.createElement('div');
    this._progressbar.classList.add('progress-bar');
    this._progressbar.setAttribute('role', 'progressbar');
    this._progressbar.setAttribute('aria-valuenow', '0');
    this._progressbar.setAttribute('aria-valuemin', '0');
    this._progressbar.setAttribute('aria-valuemax', '100');
    this._progressbar.style.width = '0%';
    progressBar.appendChild(this._progressbar);
    document.body.appendChild(this._backdrop);
}

ProgressModal.prototype.show = function() {
    return new Promise((function(resolve, reject) {
        this._backdrop.classList.remove('widget-modal-hidden');
        this._backdrop.classList.add('widget-modal-show');

        var shown = (function() {
            this._backdrop.classList.remove('widget-modal-show');
            this._backdrop.removeEventListener('animationend', shown);
            resolve();
        }).bind(this);
        this._backdrop.addEventListener('animationend', shown);

        // Timeout if the dialog doesn't show in 2 seconds.  Something must
        // be wrong.
        setTimeout(function() {
            reject('Could not show the save dialog, your css may be out of date.');
        }, 2000);
    }).bind(this));
};

ProgressModal.prototype.hide = function() {
    return new Promise((function(resolve) {
        this._backdrop.classList.add('widget-modal-hide');

        var hidden = (function() {
            this._backdrop.classList.add('widget-modal-hidden');
            this._backdrop.classList.remove('widget-modal-hide');
            this._backdrop.removeEventListener('animationend', hidden);
            resolve();
        }).bind(this);
        this._backdrop.addEventListener('animationend', hidden);
    }).bind(this));
};

ProgressModal.prototype.setText = function(text) {
    this._text.innerText = text;
    return this._waitForUpdate();
};

ProgressModal.prototype.setValue = function(x) {
    this._progressbar.setAttribute('aria-valuenow', String(x));
    this._progressbar.style.width = String(x * 100.0) + '%';
    return this._waitForUpdate();
};

ProgressModal.prototype._waitForUpdate = function() {
    return new Promise(function(resolve) {
        setTimeout(resolve, 0);
    });
};

module.exports = {
    ProgressModal: ProgressModal
};

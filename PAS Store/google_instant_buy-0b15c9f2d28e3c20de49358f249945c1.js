(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.GoogleInstantBuy = (function() {

    GoogleInstantBuy.name = 'GoogleInstantBuy';

    function GoogleInstantBuy() {
      this.disable = __bind(this.disable, this);

      this.gatewayChanged = __bind(this.gatewayChanged, this);

      this.updateMaskedWalletJwt = __bind(this.updateMaskedWalletJwt, this);

      this.buttonReady = __bind(this.buttonReady, this);

      this.insertContinueCheckout = __bind(this.insertContinueCheckout, this);

      this.authorizeWalletSuccessCallback = __bind(this.authorizeWalletSuccessCallback, this);

      this.requestFullWalletFailureCallback = __bind(this.requestFullWalletFailureCallback, this);

      this.requestFullWalletSuccessCallback = __bind(this.requestFullWalletSuccessCallback, this);

      this.requestMaskedWalletFailureCallback = __bind(this.requestMaskedWalletFailureCallback, this);

      this.requestMaskedWalletSuccessCallback = __bind(this.requestMaskedWalletSuccessCallback, this);
      this.enabled = true;
      this.maskedWalletJwt = false;
      this.fullWalletJwt = false;
    }

    GoogleInstantBuy.prototype.redirectToOrderCreation = function(jwt) {
      return window.location = "/checkout?goto=google_wallet&jwt=" + jwt;
    };

    GoogleInstantBuy.prototype.requestMaskedWalletSuccessCallback = function(maskedWallet) {
      if (!maskedWallet.error) {
        return this.redirectToOrderCreation(maskedWallet.jwt);
      }
    };

    GoogleInstantBuy.prototype.requestMaskedWalletFailureCallback = function(response) {};

    GoogleInstantBuy.prototype.requestFullWalletSuccessCallback = function(jwt) {
      var jwtResponse, splitName;
      if (!jwt.error) {
        jwtResponse = jwt.response.response;
        splitName = jwtResponse.pay.billingAddress.name.split(" ");
        this.getElementById('credit_card_first_name').value = splitName[0];
        this.getElementById('credit_card_last_name').value = splitName[splitName.length - 1];
        this.getElementById('credit_card_number').value = jwt.pan;
        this.getElementById('credit_card_verification_value').value = jwt.cvn;
        this.getElementById('credit_card_month').value = jwtResponse.pay.expirationMonth;
        this.getElementById('credit_card_year').value = jwtResponse.pay.expirationYear;
        return this.getElementById('purchase-form').submit();
      }
    };

    GoogleInstantBuy.prototype.requestFullWalletFailureCallback = function(response) {
      var paymentField;
      if (paymentField = this.getElementById('google-instant-buy-payment')) {
        this.reset(false);
      }
      switch (response.error) {
        case 'SPENDING_LIMIT_EXCEEDED':
          if (paymentField) {
            return this.disable('Please choose an alternative payment method.');
          }
      }
    };

    GoogleInstantBuy.prototype.reset = function(enableGoogleWallet) {
      if (enableGoogleWallet == null) {
        enableGoogleWallet = true;
      }
      if (this.enabled = enableGoogleWallet) {
        this.getElementById('google-instant-buy-payment').removeAttribute('disabled');
        this.getElementById('google-instant-buy-payment').click();
      }
      this.getElementById('cancel-purchase').style.display = 'block';
      this.getElementById('purchase-progress').style.display = 'none';
      this.getErrorMessageField().textContent = '';
      return this.getElementById('payment-methods').parentNode.className = 'gleft ';
    };

    GoogleInstantBuy.prototype.authorizeWalletSuccessCallback = function(result) {
      if (!result || (result.error != null)) {
        return;
      }
      google.wallet.online.setAccessToken(result.access_token);
      return google.wallet.online.requestMaskedWallet({
        jwt: this.requestMaskedWalletJwt,
        success: this.insertContinueCheckout,
        failure: this.requestMaskedWalletFailureCallback
      });
    };

    GoogleInstantBuy.prototype.insertContinueCheckout = function(maskedWallet) {
      var link;
      link = this.getElementById('google-wallet-continue-link');
      link.setAttribute("href", "/checkout?goto=google_wallet&jwt=" + maskedWallet['jwt']);
      return this.getElementById('google-wallet-continue').setAttribute('style', '');
    };

    GoogleInstantBuy.prototype.authorizeWallet = function(clientId, jwt) {
      this.requestMaskedWalletJwt = jwt;
      return google.wallet.online.authorize({
        clientId: clientId,
        callback: this.authorizeWalletSuccessCallback
      });
    };

    GoogleInstantBuy.prototype.buttonReady = function(params) {
      if (params.status === "SUCCESS") {
        return this.getElementById("google-wallet-button-holder").appendChild(params.walletButtonElement);
      }
    };

    GoogleInstantBuy.prototype.createWalletButton = function(jwt) {
      return google.wallet.online.createWalletButton({
        jwt: jwt,
        success: this.requestMaskedWalletSuccessCallback,
        failure: this.requestMaskedWalletFailureCallback,
        ready: this.buttonReady
      });
    };

    GoogleInstantBuy.prototype.updateMaskedWalletJwt = function(jwt) {
      var jwtResponse;
      if (jwt != null) {
        jwtResponse = jwt.response.response;
        this.getElementById('google-instant-buy-email').textContent = jwtResponse.email;
        this.getElementById('google-instant-buy-description').textContent = jwtResponse.pay.description.first();
        return new Ajax.Request(Wallet.url, {
          parameters: {
            jwt: jwt.jwt
          }
        });
      }
    };

    GoogleInstantBuy.prototype.changeMaskedWallet = function() {
      return google.wallet.online.changeMaskedWallet({
        jwt: this.maskedWalletJwt,
        success: this.updateMaskedWalletJwt,
        failure: this.requestMaskedWalletFailureCallback
      });
    };

    GoogleInstantBuy.prototype.updateFullWalletJwt = function(jwt) {
      this.fullWalletJwt = jwt;
      if (!this.enabled) {
        return this.reset();
      }
    };

    GoogleInstantBuy.prototype.requestFullWallet = function() {
      return google.wallet.online.requestFullWallet({
        jwt: this.fullWalletJwt,
        success: this.requestFullWalletSuccessCallback,
        failure: this.requestFullWalletFailureCallback
      });
    };

    GoogleInstantBuy.prototype.notifyTransactionStatus = function(jwt) {
      return google.wallet.online.notifyTransactionStatus({
        jwt: jwt
      });
    };

    GoogleInstantBuy.prototype.gatewayChanged = function(event) {
      var source;
      source = event.srcElement;
      if (source.name === "gateway" && source.id === "google-instant-buy-payment") {
        return this.enabled = true;
      } else {
        return this.enabled = false;
      }
    };

    GoogleInstantBuy.prototype.disable = function(reason) {
      var paymentField;
      this.enabled = false;
      if (!(paymentField = this.getElementById('google-instant-buy-payment'))) {
        return;
      }
      paymentField.setAttribute('disabled', 'disabled');
      if (paymentField.checked) {
        this.getElementById('direct-payment').click();
      }
      if (reason) {
        this.getErrorMessageField().textContent = reason;
        return this.getElementById('payment-methods').parentNode.className += 'field-with-errors';
      }
    };

    GoogleInstantBuy.prototype.getElementById = function(selector) {
      return document.getElementById(selector);
    };

    GoogleInstantBuy.prototype.getErrorMessageField = function() {
      return document.getElementsByClassName('error-message')[0];
    };

    GoogleInstantBuy.prototype.finishCheckout = function() {
      if (this.enabled && this.getElementById('google-instant-buy-payment').checked) {
        return this.requestFullWallet();
      } else {
        return this.getElementById('purchase-form').submit();
      }
    };

    return GoogleInstantBuy;

  })();

}).call(this);

$(function(){
    'use strict'

    var socket = io();
    //ask if user is the room's admin: yes-> set admin ? -> register id

    //if: yes:
    $('.js-set-admin').on('click', function() {
        var adminId = $(this).data('user-id');
        socket.emit('setAdminId', adminId);
    });
    //else:
    $('.js-register-room').on('click', function() {
        var userId = $(this).data('user-id');
        var userNick = $(this).data('user-nick');
        socket.emit('registerId', userNick, userId);
    });

    $('.js-ask-permission').on('click', function() {
        var userId = $(this).data('user-id');
        var userNick = $(this).data('user-nick');
        socket.emit('askForBoard', userId, userNick);
    });

    socket.on('askForBoard', function(userId, userNick) {
        $.confirm({
            title: 'Board permissions',
            content: 'User ' + userNick + ' want board permissions',
            buttons: {
                confirm: function () {
                    //do http POST request to board-ms in .done do this
                    socket.emit('answerForBoard', true, userId, userNick);
                },
                cancel: function () {
                    socket.emit('answerForBoard', false, userId, userNick);
                }
            }
        });

    });

    socket.on('answerForBoard', function (msg) {
        $.alert({
            title: 'Permisos Tablero',
            content: msg,
        });
    });
});

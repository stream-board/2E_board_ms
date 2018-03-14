$(function(){
    'use strict'

    var socket = io();
    //ask if user is the room's admin: yes-> set admin ? -> register id

    //if: yes:
    $('.js-set-admin').on('click', function() {
        var adminId = $(this).data('user-id');
        var data = JSON.stringify({
          adminId = $(this).data('user-id')
        });
        socket.emit('setAdminId', data);
    });
    //else:
    $('.js-register-room').on('click', function() {
        var userId = $(this).data('user-id');
        var userNick = $(this).data('user-nick');
        var data = JSON.stringify({
          userNick = $(this).data('user-nick'),
          userId = $(this).data('user-id')
        })
        socket.emit('registerId', data);
    });

    $('.js-ask-permission').on('click', function() {
        var userId = $(this).data('user-id');
        var userNick = $(this).data('user-nick');
        var data = JSON.stringify({
          userNick = $(this).data('user-nick'),
          userId = $(this).data('user-id')
        })
        socket.emit('askForBoard', data);
    });

    socket.on('askForBoard', function(data) {
        $.confirm({
            title: 'Board permissions',
            content: 'User ' + data.userNick + ' want board permissions',
            buttons: {
                confirm: function () {
                    //do http POST request to board-ms in .done do this
                    socket.emit('answerForBoard', true, data);
                },
                cancel: function () {
                    socket.emit('answerForBoard', false, data);
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

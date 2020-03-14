import Swal from 'sweetalert2'

export function showError(message) {
    Swal({
        title: "Error",
        text: message,
        type: "error"
    })
}

export function showMixin(message, type = "success") {
    const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    toast({
        type: type,
        title: message
    })
}
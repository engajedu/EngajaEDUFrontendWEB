import Swal from "sweetalert2";

const DarkSwal = Swal.mixin({
    customClass: {
      popup: 'swal2-popup',
      title: 'swal2-title',
      confirmButton: 'swal2-styled swal2-confirm',
      cancelButton: 'swal2-styled swal2-cancel',
    },
    background: '#333',
    color: '#fff',
  });
  
export default DarkSwal;
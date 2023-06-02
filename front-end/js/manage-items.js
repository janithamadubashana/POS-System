
const tbodyElm = $("#tbl-items tbody");
const modalElm = $("#new-items-modal");
const txtCode = $("#txt-code");
const txtDescription = $("#txt-description");
const txtUnitPrice = $("#txt-unit-price");
const txtQty = $("#txt-initial-stock");
const btnSave = $("#btn-save");

tbodyElm.empty();

function formatItemCode(code) {
    return `I${code.toString().padStart(3, '0')}`;
}

[txtDescription, txtUnitPrice, txtQty].forEach(txtElm =>
    $(txtElm).addClass('animate__animated'));
function formatPrice(price) {
    const nf = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return nf.format(price);
}
btnSave.on('click', () => {
    if (!validateData()) {
        return false;
    }

    const code = txtCode.val().trim();
    const description= txtDescription.val().trim();
    const unitPrice = txtUnitPrice.val().trim();
    const qty = txtQty.val().trim();

    let item = {
        code,description, unitPrice, qty
    };

    /* Todo: Send a request to the server to save the customer */

    /* 1. Create xhr object */
    const xhr = new XMLHttpRequest();

    /* 2. Set an event listener to listen readystatechange */
    xhr.addEventListener('readystatechange', ()=> {
        if (xhr.readyState === 4){
            [txtCode,txtDescription, txtUnitPrice, txtQty, btnSave].forEach(elm => elm.removeAttr('disabled'));
            $("#loader").css('visibility', 'hidden');
            if (xhr.status === 201){
                item = JSON.parse(xhr.responseText);
                getItems();
                resetForm(true);
                txtDescription.trigger('focus');
                showToast('success', 'Saved', 'Item has been saved successfully');
            }else{
                const errorObj = JSON.parse(xhr.responseText);
                showToast('error', 'Failed to save', errorObj.message);
            }
        }
    });

    /* 3. Let's open the request */
    xhr.open('POST', 'http://localhost:8080/pos/items', true);

    /* 4. Let's set some request headers */
    xhr.setRequestHeader('Content-Type', 'application/json');
    showProgress(xhr);
    /* 5. Okay, time to send the request */
    xhr.send(JSON.stringify(item));

    [txtCode, txtUnitPrice, txtQty, btnSave].forEach(elm => elm.attr('disabled', 'true'));
    $("#loader").css('visibility', 'visible');

});

function validateData() {
    const description = txtDescription.val().trim();
    const unitPrice = txtUnitPrice.val().trim();
    const qty = txtQty.val().trim();
    let valid = true;
    resetForm();

    if (!qty) {
        valid = invalidate(txtQty, "Initial Stock can't be empty");
    } else if (!/^\d{1,}$/.test(qty)) {
        valid = invalidate(txtQty, 'Invalid stock');
    }

    if (!unitPrice) {
        valid = invalidate(txtUnitPrice, "Unit Price can't be empty");
    } else if (!/^\d{1,}$/.test(unitPrice)) {
        valid = invalidate(txtUnitPrice, 'Invalid unit price');
    }

    if (!description) {
        valid = invalidate(txtDescription, "Description can't be empty");
    } else if (!/^[A-Za-z ]+$/.test(description)) {
        valid = invalidate(txtDescription, "Invalid description");
    }

    return valid;
}

function invalidate(txt, msg) {
    setTimeout(() => txt.addClass('is-invalid animate__shakeX'), 0);
    txt.trigger('select');
    txt.next().text(msg);
    return false;
}

function resetForm(clearData) {
    [txtCode, txtDescription, txtUnitPrice, txtQty].forEach(txt => {
        txt.removeClass("is-invalid animate__shakeX");
        if (clearData) txt.val('');
    });
}

modalElm.on('show.bs.modal', () => {
    resetForm(true);
    // txtCode.parent().hide();
    setTimeout(() => txtDescription.trigger('focus'), 500);
});

function showToast(toastType, header, message) {
    const toast = $("#toast .toast");
    toast.removeClass("text-bg-success text-bg-warning text-bg-danger");
    switch (toastType) {
        case 'success':
            toast.addClass('text-bg-success');
            break;
        case 'warning':
            toast.addClass('text-bg-warning');
            break;
        case 'error':
            toast.addClass('text-bg-danger');
            break;
        default:
    }
    $("#toast .toast-header > strong").text(header);
    $("#toast .toast-body").text(message);
    toast.toast('show');
}


function getItems(){
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', ()=> {
        if (xhr.readyState === 4){
            if (xhr.status === 200){
                tbodyElm.empty();
                const itemList = JSON.parse(xhr.responseText);
                itemList.forEach(item => {
                    tbodyElm.append(`
                    <tr>
                        <td class="text-center">${formatItemCode(item.code)}</td>
                        <td>${item.description}</td>
                        <td class="d-none d-xl-table-cell">${item.unitPrice}</td>
                        <td class="contact text-center">${item.qty}</td>
                        <td>
                            <div class="actions d-flex gap-3 justify-content-center">
                                <svg data-bs-toggle="tooltip" data-bs-title="Edit Customer" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                    class="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path
                                        d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fill-rule="evenodd"
                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                                <svg data-bs-toggle="tooltip" data-bs-title="Delete Customer" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                    class="bi bi-trash delete"  viewBox="0 0 16 16">
                                    <path
                                        d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                    <path
                                        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                </svg>
                            </div>
                        </td>
                    </tr>
                `);
                });
                if (!itemList.length){
                    $("#tbl-items tfoot").show();
                }else {
                    $("#tbl-items tfoot").hide();
                }
            }else{
                tbodyElm.empty();
                $("#tbl-items tfoot").show();
                showToast('error', 'Failed', 'Failed to fetch items');
                console.log(JSON.parse(xhr.responseText));
            }
        }
    });

    const searchText = $("#txt-search").val().trim();
    const query = (searchText) ? `?q=${searchText}`: "";

    xhr.open('GET', 'http://localhost:8080/pos/items' + query, true);

    xhr.send();
}

getItems();
$("#txt-search").on('input', ()=> getItems());



tbodyElm.on('click', ".delete", (eventData)=> {
    /* XHR -> jQuery AJAX */
    const id = +$(eventData.target).parents("tr").children("td:first-child").text().replace('I', '');
    const xhr = new XMLHttpRequest();
    const jqxhr = $.ajax(`http://localhost:8080/pos/items/${id}`, {
        method: 'DELETE',
        xhr: ()=> xhr
    });
    showProgress(xhr);
    jqxhr.done(()=> {
        showToast('success', 'Deleted', 'Item has been deleted successfully');
        $(eventData.target).tooltip('dispose');
        getItems();
    });
    jqxhr.fail(()=> {
        showToast('error', 'Failed', "Failed to delete the item, try again!");
    });
});
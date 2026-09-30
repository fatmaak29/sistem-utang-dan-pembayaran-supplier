// ==========================================================
// SISTEM UTANG & PEMBAYARAN SUPPLIER
// PT FATMA FURNITURE
// frontend/js/script.js
// ==========================================================


// ==========================================================
// VARIABLE GLOBAL
// ==========================================================

let editSupplierId = null;
let editUtangId = null;

let dataSupplier = [];
let dataUtang = [];
let dataPembayaran = [];


// ==========================================================
// FORMAT RUPIAH
// ==========================================================

function formatRupiah(angka) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(Number(angka || 0));

}


// ==========================================================
// FORMAT TANGGAL
// ==========================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const bagian = tanggal.split("-");

    if (bagian.length !== 3) {
        return tanggal;
    }

    return `${bagian[2]}/${bagian[1]}/${bagian[0]}`;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================================
// SAAT HALAMAN SELESAI DIMUAT
// ==========================================================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("SCRIPT.JS BERHASIL DIMUAT");

    setupNavigasi();
    setupSidebar();
    setupFormSupplier();
    setupFormUtang();
    setupFormPembayaran();
    setupPencarianSupplier();

    if (!window.db) {

        console.error("DATABASE BELUM TERHUBUNG");

        alert("Database belum terhubung. Periksa backend/config.js.");

        return;
    }

    await refreshSemuaData();

});


// ==========================================================
// NAVIGASI SIDEBAR
// ==========================================================

function setupNavigasi() {

    const menuItems =
        document.querySelectorAll(".menu-item");

    const pages =
        document.querySelectorAll(".page");


    menuItems.forEach(function (menu) {

        menu.addEventListener("click", async function () {

            const target = this.dataset.page;

            console.log("Menu diklik:", target);


            // Hapus active menu
            menuItems.forEach(function (item) {
                item.classList.remove("active");
            });


            // Hapus active page
            pages.forEach(function (page) {
                page.classList.remove("active");
            });


            // Aktifkan menu
            this.classList.add("active");


            // Cari halaman
            const targetPage =
                document.getElementById(
                    "page-" + target
                );


            if (targetPage) {

                targetPage.classList.add("active");

            } else {

                console.error(
                    "Halaman tidak ditemukan:",
                    "page-" + target
                );

                return;
            }


            // Refresh data sesuai halaman
            if (!window.db) {
                return;
            }


            if (target === "dashboard") {

                await loadDashboard();

            }


            if (target === "supplier") {

                await loadSupplier();

            }


            if (target === "utang") {

                await loadSupplier();
                await loadUtang();

            }


            if (target === "pembayaran") {

                await loadSupplier();
                await loadUtang();
                await loadPembayaran();

            }

        });

    });

}


// ==========================================================
// SIDEBAR
// ==========================================================

function setupSidebar() {

    const tombol =
        document.getElementById("toggleSidebar");


    if (!tombol) {
        return;
    }


    tombol.addEventListener("click", function () {

        if (window.innerWidth <= 800) {

            document.body.classList.toggle(
                "sidebar-mobile"
            );

        } else {

            document.body.classList.toggle(
                "sidebar-hidden"
            );

        }

    });

}


// ==========================================================
// REFRESH SEMUA DATA
// ==========================================================

async function refreshSemuaData() {

    await loadSupplier();

    await loadUtang();

    await loadPembayaran();

    await loadDashboard();

}


// ==========================================================
// ==========================================================
// SUPPLIER
// ==========================================================
// ==========================================================


// ==========================================================
// SETUP FORM SUPPLIER
// ==========================================================

function setupFormSupplier() {

    const form =
        document.getElementById("formSupplier");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        simpanSupplier
    );


    form.addEventListener(
        "reset",
        function () {

            editSupplierId = null;

            const judul =
                document.getElementById(
                    "judulSupplier"
                );

            const tombol =
                document.getElementById(
                    "btnSupplier"
                );


            if (judul) {
                judul.textContent =
                    "Tambah Supplier";
            }


            if (tombol) {

                tombol.innerHTML =
                    '<i class="fa-solid fa-floppy-disk"></i> Simpan Supplier';

            }

        }
    );

}


// ==========================================================
// LOAD SUPPLIER
// ==========================================================

async function loadSupplier() {

    if (!window.db) {
        return;
    }


    const { data, error } =
        await window.db
            .from("supplier")
            .select("*")
            .order(
                "id_supplier",
                { ascending: true }
            );


    if (error) {

        console.error(
            "Gagal mengambil supplier:",
            error
        );

        return;
    }


    dataSupplier = data || [];


    tampilkanSupplier(dataSupplier);

    isiDropdownSupplier();

}


// ==========================================================
// TAMPILKAN SUPPLIER
// ==========================================================

function tampilkanSupplier(data) {

    const tbody =
        document.getElementById(
            "tabelSupplier"
        );


    const jumlah =
        document.getElementById(
            "jumlahSupplier"
        );


    if (jumlah) {

        jumlah.textContent =
            `${data.length} supplier`;

    }


    if (!tbody) {
        return;
    }


    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >

                    Belum ada data supplier.

                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        data.map(function (supplier, index) {

            return `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            supplier.nama_supplier
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            supplier.alamat || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            supplier.no_telp || "-"
                        )}
                    </td>

                    <td class="actions">

                        <button
                            type="button"
                            class="icon-btn edit"
                            onclick="editSupplier(${supplier.id_supplier})"
                            title="Edit Supplier"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="icon-btn delete"
                            onclick="hapusSupplier(${supplier.id_supplier})"
                            title="Hapus Supplier"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


// ==========================================================
// SIMPAN / UPDATE SUPPLIER
// ==========================================================

async function simpanSupplier(event) {

    event.preventDefault();


    if (!window.db) {

        alert("Database belum terhubung.");

        return;
    }


    const nama =
        document
            .getElementById("namaSupplier")
            .value
            .trim();


    const alamat =
        document
            .getElementById("alamat")
            .value
            .trim();


    const noTelp =
        document
            .getElementById("noTelp")
            .value
            .trim();


    if (!nama) {

        alert("Nama supplier wajib diisi.");

        return;
    }


    const payload = {

        nama_supplier: nama,

        alamat:
            alamat === ""
                ? null
                : alamat,

        no_telp:
            noTelp === ""
                ? null
                : noTelp

    };


    let error;


    if (editSupplierId === null) {

        const hasil =
            await window.db
                .from("supplier")
                .insert([payload]);

        error = hasil.error;

    } else {

        const hasil =
            await window.db
                .from("supplier")
                .update(payload)
                .eq(
                    "id_supplier",
                    editSupplierId
                );

        error = hasil.error;

    }


    if (error) {

        console.error(
            "Gagal menyimpan supplier:",
            error
        );

        alert(
            "Supplier gagal disimpan.\n\n" +
            error.message
        );

        return;
    }


    alert(
        editSupplierId === null
            ? "Supplier berhasil ditambahkan."
            : "Supplier berhasil diperbarui."
    );


    editSupplierId = null;


    document
        .getElementById("formSupplier")
        .reset();


    await refreshSemuaData();

}


// ==========================================================
// EDIT SUPPLIER
// ==========================================================

function editSupplier(id) {

    const supplier =
        dataSupplier.find(function (item) {

            return Number(item.id_supplier) ===
                Number(id);

        });


    if (!supplier) {

        alert("Data supplier tidak ditemukan.");

        return;
    }


    editSupplierId =
        supplier.id_supplier;


    document.getElementById(
        "namaSupplier"
    ).value =
        supplier.nama_supplier || "";


    document.getElementById(
        "alamat"
    ).value =
        supplier.alamat || "";


    document.getElementById(
        "noTelp"
    ).value =
        supplier.no_telp || "";


    document.getElementById(
        "judulSupplier"
    ).textContent =
        "Edit Supplier";


    document.getElementById(
        "btnSupplier"
    ).innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Update Supplier';


    document.getElementById(
        "formSupplier"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================================
// HAPUS SUPPLIER
// ==========================================================

async function hapusSupplier(id) {

    if (!window.db) {
        return;
    }


    const yakin =
        confirm(
            "Yakin ingin menghapus supplier ini?"
        );


    if (!yakin) {
        return;
    }


    const { error } =
        await window.db
            .from("supplier")
            .delete()
            .eq(
                "id_supplier",
                id
            );


    if (error) {

        console.error(
            "Gagal menghapus supplier:",
            error
        );


        alert(
            "Supplier gagal dihapus.\n\n" +
            "Supplier yang sudah mempunyai data utang tidak dapat dihapus."
        );

        return;
    }


    alert("Supplier berhasil dihapus.");


    await refreshSemuaData();

}


// ==========================================================
// PENCARIAN SUPPLIER
// ==========================================================

function setupPencarianSupplier() {

    const input =
        document.getElementById(
            "cariSupplier"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .toLowerCase()
                    .trim();


            const hasil =
                dataSupplier.filter(
                    function (supplier) {

                        return (

                            String(
                                supplier.nama_supplier || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            String(
                                supplier.alamat || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            String(
                                supplier.no_telp || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                        );

                    }
                );


            tampilkanSupplier(hasil);

        }
    );

}


// ==========================================================
// DROPDOWN SUPPLIER UNTUK UTANG
// ==========================================================

function isiDropdownSupplier() {

    const select =
        document.getElementById(
            "supplierUtang"
        );


    if (!select) {
        return;
    }


    const nilaiSaatIni =
        select.value;


    select.innerHTML =
        '<option value="">Pilih Supplier</option>';


    dataSupplier.forEach(
        function (supplier) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                supplier.id_supplier;


            option.textContent =
                supplier.nama_supplier;


            select.appendChild(option);

        }
    );


    select.value =
        nilaiSaatIni;

}


// ==========================================================
// ==========================================================
// UTANG
// ==========================================================
// ==========================================================


// ==========================================================
// SETUP FORM UTANG
// ==========================================================

function setupFormUtang() {

    const form =
        document.getElementById(
            "formUtang"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        simpanUtang
    );


    form.addEventListener(
        "reset",
        function () {

            editUtangId = null;


            const judul =
                document.getElementById(
                    "judulUtang"
                );


            const tombol =
                document.getElementById(
                    "btnUtang"
                );


            if (judul) {

                judul.textContent =
                    "Tambah Utang";

            }


            if (tombol) {

                tombol.innerHTML =
                    '<i class="fa-solid fa-floppy-disk"></i> Simpan Utang';

            }

        }
    );

}


// ==========================================================
// LOAD UTANG
// ==========================================================

async function loadUtang() {

    if (!window.db) {
        return;
    }


    const { data, error } =
        await window.db
            .from("utang")
            .select(`
                id_utang,
                id_supplier,
                tanggal_utang,
                jatuh_tempo,
                jumlah_utang,
                status,
                supplier (
                    nama_supplier
                )
            `)
            .order(
                "id_utang",
                { ascending: true }
            );


    if (error) {

        console.error(
            "Gagal mengambil utang:",
            error
        );

        return;
    }


    dataUtang = data || [];


    await tampilkanUtang();

    await isiDropdownUtang();

}


// ==========================================================
// TOTAL PEMBAYARAN PER UTANG
// ==========================================================

async function ambilTotalPembayaranUtang() {

    const { data, error } =
        await window.db
            .from("detail_pembayaran")
            .select(
                "id_utang, jumlah_bayar"
            );


    if (error) {

        console.error(
            "Gagal mengambil detail pembayaran:",
            error
        );

        return {};

    }


    const totals = {};


    (data || []).forEach(
        function (detail) {

            const id =
                detail.id_utang;


            if (!totals[id]) {
                totals[id] = 0;
            }


            totals[id] +=
                Number(
                    detail.jumlah_bayar || 0
                );

        }
    );


    return totals;

}


// ==========================================================
// TAMPILKAN UTANG
// ==========================================================

async function tampilkanUtang() {

    const tbody =
        document.getElementById(
            "tabelUtang"
        );


    if (!tbody) {
        return;
    }


    if (dataUtang.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty"
                >

                    Belum ada data utang.

                </td>

            </tr>

        `;

        return;
    }


    const totalBayar =
        await ambilTotalPembayaranUtang();


    tbody.innerHTML =
        dataUtang.map(
            function (utang, index) {

                const jumlahUtang =
                    Number(
                        utang.jumlah_utang || 0
                    );


                const terbayar =
                    Number(
                        totalBayar[
                            utang.id_utang
                        ] || 0
                    );


                const sisa =
                    Math.max(
                        jumlahUtang - terbayar,
                        0
                    );


                let statusClass =
                    "belum";


                if (
                    utang.status ===
                    "Sebagian"
                ) {

                    statusClass =
                        "sebagian";

                }


                if (
                    utang.status ===
                    "Lunas"
                ) {

                    statusClass =
                        "lunas";

                }


                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                utang.supplier
                                    ?.nama_supplier
                                || "-"
                            )}
                        </td>

                        <td>
                            ${formatTanggal(
                                utang.tanggal_utang
                            )}
                        </td>

                        <td>
                            ${formatTanggal(
                                utang.jatuh_tempo
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                jumlahUtang
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                terbayar
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                sisa
                            )}
                        </td>

                        <td>

                            <span
                                class="status ${statusClass}"
                            >

                                ${escapeHtml(
                                    utang.status
                                )}

                            </span>

                        </td>

                        <td class="actions">

                            <button
                                type="button"
                                class="icon-btn edit"
                                onclick="editUtang(${utang.id_utang})"
                                title="Edit Utang"
                            >

                                <i class="fa-solid fa-pen"></i>

                            </button>


                            <button
                                type="button"
                                class="icon-btn delete"
                                onclick="hapusUtang(${utang.id_utang})"
                                title="Hapus Utang"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ==========================================================
// SIMPAN UTANG
// ==========================================================

async function simpanUtang(event) {

    event.preventDefault();


    if (!window.db) {

        alert("Database belum terhubung.");

        return;
    }


    const idSupplier =
        document.getElementById(
            "supplierUtang"
        ).value;


    const tanggalUtang =
        document.getElementById(
            "tanggalUtang"
        ).value;


    const jatuhTempo =
        document.getElementById(
            "jatuhTempo"
        ).value;


    const jumlahUtang =
        Number(
            document.getElementById(
                "jumlahUtang"
            ).value
        );


    if (!idSupplier) {

        alert("Pilih supplier terlebih dahulu.");

        return;
    }


    if (!tanggalUtang) {

        alert("Tanggal utang wajib diisi.");

        return;
    }


    if (
        !jumlahUtang ||
        jumlahUtang <= 0
    ) {

        alert(
            "Jumlah utang harus lebih dari 0."
        );

        return;
    }


    const payload = {

        id_supplier:
            Number(idSupplier),

        tanggal_utang:
            tanggalUtang,

        jatuh_tempo:
            jatuhTempo || null,

        jumlah_utang:
            jumlahUtang

    };


    let error;


    if (editUtangId === null) {

        payload.status =
            "Belum Lunas";


        const hasil =
            await window.db
                .from("utang")
                .insert([payload]);


        error =
            hasil.error;

    } else {

        const hasil = await window.db.rpc("perbarui_utang", {
            p_id_utang: editUtangId,
            p_id_supplier: payload.id_supplier,
            p_tanggal_utang: payload.tanggal_utang,
            p_jatuh_tempo: payload.jatuh_tempo,
            p_jumlah_utang: payload.jumlah_utang
        });

        error = hasil.error;

    }


    if (error) {

        console.error(
            "Gagal menyimpan utang:",
            error
        );


        alert(
            "Data utang gagal disimpan.\n\n" +
            error.message
        );

        return;
    }


    alert(
        editUtangId === null
            ? "Utang berhasil ditambahkan."
            : "Utang berhasil diperbarui."
    );


    editUtangId = null;


    document
        .getElementById("formUtang")
        .reset();


    await refreshSemuaData();

}


// ==========================================================
// EDIT UTANG
// ==========================================================

function editUtang(id) {

    const utang =
        dataUtang.find(
            function (item) {

                return Number(
                    item.id_utang
                ) === Number(id);

            }
        );


    if (!utang) {

        alert(
            "Data utang tidak ditemukan."
        );

        return;
    }


    editUtangId =
        utang.id_utang;


    document.getElementById(
        "supplierUtang"
    ).value =
        utang.id_supplier;


    document.getElementById(
        "tanggalUtang"
    ).value =
        utang.tanggal_utang || "";


    document.getElementById(
        "jatuhTempo"
    ).value =
        utang.jatuh_tempo || "";


    document.getElementById(
        "jumlahUtang"
    ).value =
        utang.jumlah_utang || "";


    document.getElementById(
        "judulUtang"
    ).textContent =
        "Edit Utang";


    document.getElementById(
        "btnUtang"
    ).innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Update Utang';


    document.getElementById(
        "formUtang"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================================
// HAPUS UTANG
// ==========================================================

async function hapusUtang(id) {

    if (!window.db) {
        return;
    }


    const yakin =
        confirm(
            "Yakin ingin menghapus data utang ini?"
        );


    if (!yakin) {
        return;
    }


    const { error } =
        await window.db
            .from("utang")
            .delete()
            .eq(
                "id_utang",
                id
            );


    if (error) {

        console.error(
            "Gagal menghapus utang:",
            error
        );


        alert(
            "Utang gagal dihapus.\n\n" +
            "Jika utang sudah mempunyai pembayaran, hapus pembayaran terlebih dahulu."
        );

        return;
    }


    alert(
        "Data utang berhasil dihapus."
    );


    await refreshSemuaData();

}


// ==========================================================
// ==========================================================
// PEMBAYARAN
// ==========================================================
// ==========================================================


// ==========================================================
// SETUP FORM PEMBAYARAN
// ==========================================================

function setupFormPembayaran() {

    const form =
        document.getElementById(
            "formPembayaran"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        simpanPembayaran
    );

}


// ==========================================================
// DROPDOWN UTANG
// HANYA UTANG YANG BELUM LUNAS
// ==========================================================

async function isiDropdownUtang() {

    const select =
        document.getElementById(
            "utangPembayaran"
        );


    if (!select) {
        return;
    }


    const totalBayar =
        await ambilTotalPembayaranUtang();


    select.innerHTML =
        '<option value="">Pilih Utang Supplier</option>';


    dataUtang.forEach(
        function (utang) {

            const jumlah =
                Number(
                    utang.jumlah_utang || 0
                );


            const dibayar =
                Number(
                    totalBayar[
                        utang.id_utang
                    ] || 0
                );


            const sisa =
                jumlah - dibayar;


            if (sisa <= 0) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                utang.id_utang;


            option.textContent =
                `${utang.supplier?.nama_supplier || "Supplier"} - ${formatRupiah(sisa)}`;


            option.dataset.sisa =
                sisa;


            select.appendChild(
                option
            );

        }
    );

}


// ==========================================================
// SIMPAN PEMBAYARAN
// ==========================================================

async function simpanPembayaran(event) {

    event.preventDefault();


    if (!window.db) {

        alert(
            "Database belum terhubung."
        );

        return;
    }


    const idUtang =
        Number(
            document.getElementById(
                "utangPembayaran"
            ).value
        );


    const tanggal =
        document.getElementById(
            "tanggalPembayaran"
        ).value;


    const jumlah =
        Number(
            document.getElementById(
                "jumlahBayar"
            ).value
        );


    const metode =
        document.getElementById(
            "metodePembayaran"
        ).value;


    if (!idUtang) {

        alert(
            "Pilih utang supplier."
        );

        return;
    }


    if (!tanggal) {

        alert(
            "Tanggal pembayaran wajib diisi."
        );

        return;
    }


    if (
        !jumlah ||
        jumlah <= 0
    ) {

        alert(
            "Jumlah pembayaran harus lebih dari 0."
        );

        return;
    }


    const { error } = await window.db.rpc("catat_pembayaran", {
        p_id_utang: idUtang,
        p_tanggal: tanggal,
        p_metode: metode,
        p_jumlah: jumlah
    });


    if (error) {

        console.error("Gagal menyimpan pembayaran:", error);

        alert(
            "Pembayaran gagal disimpan.\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Pembayaran berhasil disimpan."
    );


    document
        .getElementById(
            "formPembayaran"
        )
        .reset();


    await refreshSemuaData();

}


// ==========================================================
// LOAD PEMBAYARAN
// ==========================================================

async function loadPembayaran() {

    if (!window.db) {
        return;
    }


    const { data, error } =
        await window.db
            .from("detail_pembayaran")
            .select(`
                id_detail,
                id_utang,
                jumlah_bayar,

                pembayaran (
                    id_pembayaran,
                    tanggal_pembayaran,
                    metode_pembayaran
                ),

                utang (
                    id_utang,
                    supplier (
                        nama_supplier
                    )
                )
            `)
            .order(
                "id_detail",
                { ascending: false }
            );


    if (error) {

        console.error(
            "Gagal mengambil pembayaran:",
            error
        );

        return;
    }


    dataPembayaran =
        data || [];


    tampilkanPembayaran();

}


// ==========================================================
// TAMPILKAN PEMBAYARAN
// ==========================================================

function tampilkanPembayaran() {

    const tbody =
        document.getElementById(
            "tabelPembayaran"
        );


    if (!tbody) {
        return;
    }


    if (
        dataPembayaran.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >

                    Belum ada pembayaran.

                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        dataPembayaran.map(
            function (detail, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                detail
                                    .utang
                                    ?.supplier
                                    ?.nama_supplier
                                || "-"
                            )}
                        </td>

                        <td>
                            ${formatTanggal(
                                detail
                                    .pembayaran
                                    ?.tanggal_pembayaran
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                detail.jumlah_bayar
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                detail
                                    .pembayaran
                                    ?.metode_pembayaran
                                || "-"
                            )}
                        </td>

                        <td class="actions">

                            <button
                                type="button"
                                class="icon-btn delete"
                                onclick="hapusPembayaran(${detail.id_detail})"
                                title="Hapus Pembayaran"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ==========================================================
// HAPUS PEMBAYARAN
// ==========================================================

async function hapusPembayaran(idDetail) {

    if (!window.db) {
        return;
    }


    const yakin =
        confirm(
            "Yakin ingin menghapus pembayaran ini?"
        );


    if (!yakin) {
        return;
    }


    const { error } = await window.db.rpc("hapus_pembayaran", {
        p_id_detail: idDetail
    });


    if (error) {

        console.error("Gagal menghapus pembayaran:", error);

        alert(
            "Pembayaran gagal dihapus.\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Pembayaran berhasil dihapus."
    );


    await refreshSemuaData();

}


// ==========================================================
// ==========================================================
// DASHBOARD
// ==========================================================
// ==========================================================

async function loadDashboard() {

    if (!window.db) {
        return;
    }


    // Total Supplier
    const {
        count: totalSupplier,
        error: errorSupplier
    } =
        await window.db
            .from("supplier")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    if (errorSupplier) {

        console.error(
            "Dashboard supplier:",
            errorSupplier
        );

    }


    // Semua Utang
    const {
        data: utang,
        error: errorUtang
    } =
        await window.db
            .from("utang")
            .select(
                "jumlah_utang"
            );


    if (errorUtang) {

        console.error(
            "Dashboard utang:",
            errorUtang
        );

    }


    // Semua Pembayaran
    const {
        data: pembayaran,
        error: errorBayar
    } =
        await window.db
            .from(
                "detail_pembayaran"
            )
            .select(
                "jumlah_bayar"
            );


    if (errorBayar) {

        console.error(
            "Dashboard pembayaran:",
            errorBayar
        );

    }


    const totalUtang =
        (utang || []).reduce(
            function (total, item) {

                return total +
                    Number(
                        item.jumlah_utang || 0
                    );

            },
            0
        );


    const totalDibayar =
        (pembayaran || []).reduce(
            function (total, item) {

                return total +
                    Number(
                        item.jumlah_bayar || 0
                    );

            },
            0
        );


    const sisaUtang =
        Math.max(
            totalUtang -
            totalDibayar,
            0
        );


    const elSupplier =
        document.getElementById(
            "totalSupplier"
        );


    const elUtang =
        document.getElementById(
            "totalUtang"
        );


    const elDibayar =
        document.getElementById(
            "totalDibayar"
        );


    const elSisa =
        document.getElementById(
            "sisaUtang"
        );


    if (elSupplier) {

        elSupplier.textContent =
            totalSupplier || 0;

    }


    if (elUtang) {

        elUtang.textContent =
            formatRupiah(
                totalUtang
            );

    }


    if (elDibayar) {

        elDibayar.textContent =
            formatRupiah(
                totalDibayar
            );

    }


    if (elSisa) {

        elSisa.textContent =
            formatRupiah(
                sisaUtang
            );

    }

}
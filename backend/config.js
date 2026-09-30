// ==========================================================
// CONFIG SUPABASE
// backend/config.js
// ==========================================================

const SUPABASE_URL =
    "https://vuuvmdzpajidhptmwroj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d88jhv2V1ZXsHuMANGn0iA_6tjHgjLk";


if (typeof supabase === "undefined") {

    console.error(
        "Library Supabase tidak ditemukan."
    );

} else {

    window.db =
        supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    console.log(
        "DATABASE SUPABASE BERHASIL TERHUBUNG"
    );

}
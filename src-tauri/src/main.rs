// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{Read, Write};

use tauri::AppHandle;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_history_content(handle: AppHandle) -> String {
    let resource_path = handle
        .path_resolver()
        .resolve_resource("history.txt")
        .expect("failed to resolver resource");

    let mut contents = String::new();

    let mut file = match std::fs::File::open(&resource_path) {
        Ok(f) => f,
        Err(_) => std::fs::File::create_new(&resource_path).unwrap(),
    };

    let _ = file.read_to_string(&mut contents);

    contents
}

#[tauri::command]
fn write_history(handle: AppHandle, content: &str) {
    let resource_path = handle
        .path_resolver()
        .resolve_resource("history.txt")
        .expect("failed to resolver resource");

    let mut file = std::fs::OpenOptions::new()
        .write(true)
        .append(true)
        .open(&resource_path)
        .expect("Error in open file");

    if let Err(e) = write!(file, "{}", content) {
        eprint!("{}", e)
    }
}

#[tauri::command]
fn clean_history(handle: AppHandle) {
    let resource_path = handle
        .path_resolver()
        .resolve_resource("history.txt")
        .expect("failed to resolver resource");

    let mut file = std::fs::OpenOptions::new()
        .write(true)
        .open(&resource_path)
        .expect("Error in open file");

    let _ = std::fs::File::write(&mut file, "".as_bytes());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_history_content,
            write_history,
            clean_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// En Windows, sin esto se abre una consola junto a la app en las versiones finales.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    rumbo_lib::run();
}

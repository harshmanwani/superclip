use once_cell::sync::Lazy;
use std::sync::atomic::AtomicBool;

pub static SKIP_NEXT_SAVE: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

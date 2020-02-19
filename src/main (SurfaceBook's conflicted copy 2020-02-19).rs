use std::fs::File;
use std::io;
use std::io::BufRead;
use std::path::Path;

use clap::{App, Arg};
use pixels::{Pixels, SurfaceTexture, wgpu::Surface, PixelsBuilder};
use winit::{
    dpi::LogicalSize,
    event::{Event, VirtualKeyCode},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};
use winit_input_helper::WinitInputHelper;

//enum RowType {
//    BlueGreen,
//    GreenRed
//}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
    where P: AsRef<Path>
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

fn get_pixels<P>(filename: P) -> (Vec<u8>, usize, usize)
    where P: AsRef<Path>
{
    // let voltages: Vec<u8> = serde_json::from_str(include_str!("easy.txt")).ok().unwrap();

    // Assignment 1

    // let max = *voltages.iter().max_by(|x, y| x.partial_cmp(y).unwrap()).unwrap();
    // let min = *voltages.iter().min_by(|x, y| x.partial_cmp(y).unwrap()).unwrap();
    //
    // eprintln!("{:?}", (max, min));
    //
    // let (new_max, new_min) = (254f32, 0f32);
    // let m = (new_max - new_min) / (max - min) as f32;
    // let b = new_min - m * (min as f32);
    //
    // let mut img = vec![];
    //
    // for x in voltages.iter() {
    //     img.push((m * (*x + b)) as u8);
    // }

    // Assignment 2A

    // let mut img: Vec<u8> = vec![];
    // let mut current_row = RowType::BlueGreen;
    // for row in voltages.chunks_exact(WIDTH) {
    //     match current_row {
    //         RowType::BlueGreen => {
    //             for v in row {
    //                 // blue
    //                 img.push(0);
    //                 img.push(0);
    //                 img.push(*v);
    //
    //                 // green
    //                 img.push(0);
    //                 img.push(*v);
    //                 img.push(0);
    //             }
    //
    //             current_row = RowType::GreenRed;
    //         },
    //         RowType::GreenRed => {
    //             for v in row {
    //                 // green
    //                 img.push(0);
    //                 img.push(*v);
    //                 img.push(0);
    //
    //                 // red
    //                 img.push(*v);
    //                 img.push(0);
    //                 img.push(0);
    //             }
    //
    //             current_row = RowType::BlueGreen;
    //         }
    //     };
    // }

    let lines_raw = read_lines(filename).expect("Could not find/read the specified file");
    let mut lines: Vec<String> = vec![];

    for (index, line) in lines_raw.enumerate() {
        match line {
            Ok(l) => lines.push(l),
            Err(e) => panic!(format!("Could not read line {} as a string due to {}", index, e))
        }
    }

    println!("{}", lines.len());
    let mut img: Vec<u8> = vec![];

    if lines.len() < 3 {
        panic!("I see less than 3 lines in your file. Are you sure it's formatted correctly?");
    }

    let height: usize = lines[1].parse().expect("Could not parse second line as an unsigned integer (height)");
    let width: usize = lines[2].parse().expect("Could not parse third line as an unsigned integer (width)");

    for (index, line) in lines.iter().skip(3).enumerate() {
        let mut len = 0usize;

        for (i, num) in line.split_whitespace().enumerate() {
            match num.parse::<u8>() {
                Ok(n) => img.push(n),
                Err(e) => {
                    match i {
                        0 => panic!(format!("Could not parse Red component of pixel no. {} as an 8-bit unsigned integer due to {}", index, e)),
                        1 => panic!(format!("Could not parse Green component of pixel no. {} as an 8-bit unsigned integer due to {}", index, e)),
                        2 => panic!(format!("Could not parse Blue component of pixel no. {} as an 8-bit unsigned integer due to {}", index, e)),
                        _ => panic!(format!("Pixel no. {} seems to have more than 3 colors due to {}", index, e))
                    }
                }
            };

            len = len + 1;
        }

        if len < 3 {
            panic!("Pixel no. {} seems to have less than 3 colors", index);
        }
    }

    println!("{}", img.len());
    (img, height, width)
}

fn main() {
    let matches = App::new("ITCS 3134 Image Viewer")
        .version("0.0.2")
        .author("Dhruv Dhamani<ddhamani@uncc.edu>")
        .arg(Arg::from_usage("<filename> -f, --file 'The path to the text file to be displayed as an image'")
            .short("f")
            .long("file")
            .value_name("FILE")
            .help("The path to the text file to be displayed as an image")
            .takes_value(true))
        .get_matches();

    let filename = matches.value_of("filename").expect("Something was wrong with the file parameter you specified.");

    let (img_pixels, height, width) = get_pixels(filename);

    let event_loop = EventLoop::new();

    let window = {
        let size = LogicalSize::new(width as f64, height as f64);
        WindowBuilder::new()
            .with_title("ITCS 3134: Image Viewer")
            .with_inner_size(size)
            .with_min_inner_size(size)
            .with_max_inner_size(size)
            .build(&event_loop)
            .unwrap()
    };

    let mut input = WinitInputHelper::new();

    let mut hidpi_factor = window.hidpi_factor();
//    let size = window.inner_size().to_physical(window.hidpi_factor());
//
//    let width = size.width.round() as u32;
//    let height = size.height.round() as u32;

    let width = width as u32;
    let height = height as u32;
    dbg!((width, height));
    let mut pixels = {
        let surface = Surface::create(&window);
        let surface_texture = SurfaceTexture::new(width, height, surface);
        PixelsBuilder::new(width, height, surface_texture)
            .pixel_aspect_ratio(1.0)
            .build()
            .expect("Couldn't make a pixel buffer")
    };
    window.request_redraw();

    event_loop.run(move |event, _, control_flow| {
        // Draw the current frame
        if let Event::RedrawRequested {
            ..
        } = event
        {
            let frame = pixels.get_frame();

            for (pixel, i) in frame.chunks_exact_mut(4).zip(img_pixels.chunks_exact(3)) {
                pixel[0] = i[0];
                pixel[1] = i[1];
                pixel[2] = i[2];
                pixel[3] = 0xff;
            }

            pixels.render();
        }
        if input.update(event) {
            // Close events
            if input.key_pressed(VirtualKeyCode::Escape) || input.quit() {
                *control_flow = ControlFlow::Exit;
                return;
            }

            // Adjust high DPI factor
            if let Some(factor) = input.hidpi_changed() {
                hidpi_factor = factor;
            }

            // Resize the window
            if let Some(size) = input.window_resized() {
                let size = size.to_physical(hidpi_factor);
                let width = size.width.round() as u32;
                let height = size.height.round() as u32;

                pixels.resize(width, height);
            }

            window.request_redraw();
        }
    });
}

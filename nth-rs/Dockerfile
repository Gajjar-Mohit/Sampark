FROM rust:1.91

WORKDIR /usr/src/app

COPY ./src ./src
COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml
COPY ./config ./config

# Build the binary (don't run it here)
RUN cargo build --release

# Run the binary at container startup
CMD ["./target/release/nth-rs"]
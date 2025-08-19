output "public_ip" {
  value = aws_instance.vm.public_ip
}

output "public_dns" {
  value = aws_instance.vm.public_dns
}

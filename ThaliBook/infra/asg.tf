resource "aws_launch_template" "thalibook" {
  name_prefix   = "thalibook"
  image_id      = "ami-0d53d72369335a9d6"
  instance_type = "t2.medium"
  key_name = aws_key_pair.key_pair.key_name 
  user_data     = filebase64("${path.module}/install.sh")
}

resource "aws_autoscaling_group" "thalibook" {
  availability_zones = ["us-west-1b"]
  desired_capacity   = 2
  max_size           = 3
  min_size           = 2
 
  load_balancers = [aws_elb.thalibook.name]
  launch_template {
    id      = aws_launch_template.thalibook.id
    version = "$Latest"
  }
}

#Create a new load balancer
resource "aws_elb" "thalibook" {
  
  name               = "thalibook-elb"
  availability_zones = ["us-west-1b"]

  health_check {
    healthy_threshold   = 2 # How many times the health check needs to succeed to be considered healthy
    unhealthy_threshold = 2 # How times the healthcheck needs to fail to mark the instance unhealthy and stop serving it traffic
    timeout             = 5 # how long to wait for the instance to respond to the health check in seconds
    target              = "HTTP:80/index.html"   # What protocol, port, and path to test
    interval            = 30 # how often instances are probed in seconds
  }
  
  listener {
    instance_port     = 80     # What port the instances are listening on
    instance_protocol = "HTTP" # What protocol the instances are using to serve traffic
    lb_port           = 80     # What port the load balancer is listening on
    lb_protocol       = "HTTP" # What protocol the load balancer is using to serve traffic
  }
}

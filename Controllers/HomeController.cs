using CelebrateDesign.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace CelebrateDesign.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Test()
        {
            return View();
        }
        public IActionResult Button()
        {
            return View();
        }


        // Add The Method in Home Controller and Corresponding View
        public IActionResult Error()
        {
            int statusCode = HttpContext.Response.StatusCode;
            ViewData["Title"] = statusCode;
            return View();
        }


    }
}

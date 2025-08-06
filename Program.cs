using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();
builder.Services.AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Add this line to use PascalCase
    });

var app = builder.Build();
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

//
//This Code Block Handles Canonical Issue and To Be Added In Program File
//app.Use(async (context, next) =>
//{
//    var request = context.Request;
//    // Check if the request is non-www and redirect to www
//    if (!request.Host.Value.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
//    {
//        var wwwUrl = $"{request.Scheme}://www.{request.Host.Value}{request.PathBase}{request.Path}{request.QueryString}";
//        context.Response.Redirect(wwwUrl, true);
//        return;
//    }
//    await next();
//});


app.UseHttpsRedirection();
// Set up HTTP Expires Header
app.UseStaticFiles();
//
//This Code Block Browser Cache and To Be Added In Program File
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Set the Expires header to one week from now
        ctx.Context.Response.Headers["Expires"] = DateTime.UtcNow.AddDays(7).ToString("R");

        // Optional: Set Cache-Control header to max-age=604800 seconds (7 days)
        ctx.Context.Response.Headers["Cache-Control"] = "public,max-age=604800";
    }
});
app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "Data",
        pattern: "PrivacyPolicy",
        defaults: new { controller = "Data", action = "Index" });

    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}");

    endpoints.MapControllerRoute(
    name: "MyArea",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");
});


// Custom 404 Error Handling
app.UseStatusCodePagesWithReExecute("/Home/Error/{0}");

app.Run();
